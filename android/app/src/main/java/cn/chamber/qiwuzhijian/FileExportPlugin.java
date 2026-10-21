package cn.chamber.qiwuzhijian;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import android.provider.DocumentsContract;

/** Saves exports through Android's document picker without storage permissions. */
@CapacitorPlugin(name = "FileExport")
public class FileExportPlugin extends Plugin {
    private static class ExportStream {
        final Uri uri; final OutputStream output;
        ExportStream(Uri uri, OutputStream output) { this.uri = uri; this.output = output; }
    }
    private final ConcurrentHashMap<String, ExportStream> streams = new ConcurrentHashMap<>();

    @PluginMethod
    public void startSave(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(call.getString("mime", "application/octet-stream"));
        intent.putExtra(Intent.EXTRA_TITLE, call.getString("name", "Wupai-Library.wupai"));
        startActivityForResult(call, intent, "streamResult");
    }

    @ActivityCallback
    private void streamResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.resolve(new JSObject().put("cancelled", true)); return;
        }
        Uri uri = result.getData().getData();
        getBridge().execute(() -> {
            try {
                OutputStream output = getContext().getContentResolver().openOutputStream(uri);
                if (output == null) throw new java.io.IOException("无法打开保存位置");
                String id = UUID.randomUUID().toString();
                streams.put(id, new ExportStream(uri, output));
                call.resolve(new JSObject().put("id", id));
            } catch (Exception error) { call.reject("保存失败：" + error.getMessage(), error); }
        });
    }

    @PluginMethod
    public void appendSave(PluginCall call) {
        String data = call.getString("base64"), id = call.getString("id", "");
        if (data == null || data.length() > 350000) { call.reject("导出分块无效"); return; }
        getBridge().execute(() -> {
            ExportStream stream = streams.get(id);
            if (stream == null) { call.reject("保存会话已结束"); return; }
            try { stream.output.write(Base64.decode(data, Base64.DEFAULT)); call.resolve(); }
            catch (Exception error) { call.reject("保存失败：" + error.getMessage(), error); }
        });
    }

    @PluginMethod
    public void finishSave(PluginCall call) {
        getBridge().execute(() -> {
            ExportStream stream = streams.remove(call.getString("id", ""));
            if (stream == null) { call.reject("保存会话已结束"); return; }
            try { stream.output.close(); call.resolve(new JSObject().put("saved", true)); }
            catch (Exception error) { call.reject("保存失败：" + error.getMessage(), error); }
        });
    }

    @PluginMethod
    public void abortSave(PluginCall call) {
        getBridge().execute(() -> {
            ExportStream stream = streams.remove(call.getString("id", ""));
            if (stream != null) {
                try { stream.output.close(); } catch (Exception ignored) { }
                try { DocumentsContract.deleteDocument(getContext().getContentResolver(), stream.uri); } catch (Exception ignored) { }
            }
            call.resolve(new JSObject().put("cancelled", true));
        });
    }

    @Override
    protected void handleOnDestroy() {
        for (ExportStream stream : streams.values()) try { stream.output.close(); } catch (Exception ignored) { }
        streams.clear();
        super.handleOnDestroy();
    }
    @PluginMethod
    public void save(PluginCall call) {
        if (call.getString("base64") == null) {
            call.reject("缺少导出文件内容");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(call.getString("mime", "application/octet-stream"));
        intent.putExtra(Intent.EXTRA_TITLE, call.getString("name", "物派-export"));
        startActivityForResult(call, intent, "exportResult");
    }

    @ActivityCallback
    private void exportResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.resolve(new JSObject().put("cancelled", true));
            return;
        }
        Uri uri = result.getData().getData();
        getBridge().execute(() -> {
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(uri)) {
                if (stream == null) throw new java.io.IOException("无法打开保存位置");
                stream.write(Base64.decode(call.getString("base64"), Base64.DEFAULT));
                call.resolve(new JSObject().put("saved", true));
            } catch (Exception error) {
                call.reject("保存失败：" + error.getMessage(), error);
            }
        });
    }
}
