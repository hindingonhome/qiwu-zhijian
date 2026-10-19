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

/** Saves exports through Android's document picker without storage permissions. */
@CapacitorPlugin(name = "FileExport")
public class FileExportPlugin extends Plugin {
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
