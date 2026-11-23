package com.musescoremobile;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.util.Base64;
import com.caverock.androidsvg.SVG;
import com.musescoremobile.SaveDocumentModule.SaveFile;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Locale;

final class WebScoreExport {
    private WebScoreExport() { }

    static SaveFile prepare(Context context, String manifestPath, String format, String title) throws Exception {
        File cache = context.getCacheDir();
        File files = context.getFilesDir();
        File manifest = new File(manifestPath).getCanonicalFile();
        File offline = new File(files, "OfflineWebScores");
        boolean saved = manifest.getPath().startsWith(offline.getCanonicalPath() + File.separator);
        requireFile(saved ? offline : new File(cache, "WebScores"), manifest);
        JSONObject score = new JSONObject(new String(Files.readAllBytes(manifest.toPath()), StandardCharsets.UTF_8));
        File media = saved ? new File(files, "OfflineWebScoreMedia") : new File(cache, "WebScoreMedia");
        String name = title.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]+", "_").trim();
        if (name.isEmpty() || name.equals(".") || name.equals("..")) name = "Score";
        name = name.substring(0, name.offsetByCodePoints(0, Math.min(55, name.codePointCount(0, name.length()))));

        switch (format) {
            case "pdf":
                JSONArray pages = score.getJSONArray("pages");
                JSONObject metadata = score.optJSONObject("metadata");
                String missingPages = !score.optBoolean("pagesDone", true)
                        ? "Страницы ещё загружаются. Повторите после загрузки."
                        : "Для сохранения PDF нужны все страницы партитуры.";
                if (metadata != null && metadata.optInt("pages", pages.length()) > pages.length()) {
                    throw new IOException(missingPages);
                }
                for (int i = 0; i < pages.length(); i++) {
                    if (pages.isNull(i)) throw new IOException(missingPages);
                }
                return preparePdf(cache, media, pages, name);
            case "mid": return prepareMidi(cache, media, score, name);
            case "audio":
                if (score.isNull("audioUrl")) throw missingMedia(score, "Аудио");
                return prepareAudio(mediaFile(media, score.getString("audioUrl")), name);
            default: throw new IOException("Неподдерживаемый формат.");
        }
    }

    private static IOException missingMedia(JSONObject score, String format) {
        return new IOException(score.optBoolean("finished", true)
                ? format + " для этой партитуры недоступно."
                : format + " ещё загружается. Повторите после загрузки.");
    }

    private static File requireFile(File root, File source) throws IOException {
        File file = source.getCanonicalFile();
        if (!file.getPath().startsWith(root.getCanonicalPath() + File.separator)
                || !file.isFile() || file.length() == 0) {
            throw new IOException("Файл в кэше партитуры недоступен.");
        }
        return file;
    }

    private static File mediaFile(File media, String url) throws IOException {
        Uri uri = Uri.parse(url);
        String authority = uri.getAuthority();
        if (!"file".equals(uri.getScheme()) || uri.getPath() == null || (authority != null && !authority.isEmpty())) {
            throw new IOException("Файл в кэше партитуры недоступен.");
        }
        return requireFile(media, new File(uri.getPath()));
    }

    private static SaveFile prepareAudio(File source, String name) throws IOException {
        byte[] head = new byte[12];
        try (DataInputStream input = new DataInputStream(new FileInputStream(source))) {
            input.readFully(head);
        }
        String tag = new String(head, StandardCharsets.ISO_8859_1);
        if (tag.startsWith("ID3") || (head[0] == (byte) 0xff && (head[1] & 0xe0) == 0xe0)) {
            return new SaveFile(source, name + ".mp3", "audio/mpeg", false);
        }
        if (tag.startsWith("OggS")) return new SaveFile(source, name + ".ogg", "audio/ogg", false);
        if (tag.startsWith("ftyp", 4)) return new SaveFile(source, name + ".m4a", "audio/mp4", false);
        if (tag.startsWith("RIFF") && tag.startsWith("WAVE", 8)) return new SaveFile(source, name + ".wav", "audio/wav", false);
        if (tag.startsWith("fLaC")) return new SaveFile(source, name + ".flac", "audio/flac", false);
        throw new IOException("Формат аудио в кэше не распознан.");
    }

    private static SaveFile prepareMidi(File cache, File media, JSONObject score, String name) throws IOException {
        String encoded = score.isNull("midiData") ? "" : score.optString("midiData", "");
        if (!encoded.isEmpty()) {
            byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
            if (bytes.length < 22 || !"MThd".equals(new String(bytes, 0, 4, StandardCharsets.US_ASCII))) {
                throw new IOException("Данные MIDI в кэше повреждены.");
            }
            File output = File.createTempFile("score-", ".mid", cache);
            try {
                Files.write(output.toPath(), bytes);
                return new SaveFile(output, name + ".mid", "audio/midi", true);
            } catch (IOException error) {
                output.delete();
                throw error;
            }
        }
        String uri = score.optString("midiUrl", "");
        if (!uri.startsWith("file:")) throw missingMedia(score, "MIDI");
        File source = mediaFile(media, uri);
        try (DataInputStream input = new DataInputStream(new FileInputStream(source))) {
            if (source.length() < 22 || input.readInt() != 0x4d546864) {
                throw new IOException("Данные MIDI в кэше повреждены.");
            }
        }
        return new SaveFile(source, name + ".mid", "audio/midi", false);
    }

    private static SaveFile preparePdf(File cache, File media, JSONArray pages, String name) throws Exception {
        if (pages.length() == 0) throw new IOException("В кэше нет страниц партитуры.");
        File output = File.createTempFile("score-", ".pdf", cache);
        boolean complete = false;
        try {
            PdfDocument pdf = new PdfDocument();
            try {
                try (FileOutputStream stream = new FileOutputStream(output)) {
                    for (int i = 0; i < pages.length(); i++) {
                        File source = mediaFile(media, pages.getString(i));
                        appendPage(pdf, source, i + 1);
                    }
                    pdf.writeTo(stream);
                }
            } finally {
                pdf.close();
            }
            complete = true;
            return new SaveFile(output, name + ".pdf", "application/pdf", true);
        } finally {
            if (!complete) output.delete();
        }
    }

    private static void appendPage(PdfDocument pdf, File source, int pageNumber) throws Exception {
        boolean png = source.getName().toLowerCase(Locale.ROOT).endsWith(".png");
        Bitmap bitmap = null;
        SVG svg = null;
        float ratio;
        if (png) {
            bitmap = BitmapFactory.decodeFile(source.getPath());
            if (bitmap == null) throw new IOException("Не удалось прочитать страницу " + pageNumber + ".");
            ratio = (float) bitmap.getWidth() / bitmap.getHeight();
        } else {
            SVG.setInternalEntitiesEnabled(false);
            try (InputStream input = new FileInputStream(source)) {
                svg = SVG.getFromInputStream(input);
            }
            ratio = svg.getDocumentAspectRatio();
            if (svg.getDocumentViewBox() == null && svg.getDocumentWidth() > 0 && svg.getDocumentHeight() > 0) {
                svg.setDocumentViewBox(0, 0, svg.getDocumentWidth(), svg.getDocumentHeight());
            }
            svg.setDocumentWidth("100%");
            svg.setDocumentHeight("100%");
        }
        if (!Float.isFinite(ratio) || ratio <= 0) {
            throw new IOException("Не удалось определить размер страницы " + pageNumber + ".");
        }
        int width = Math.max(1, Math.round(842 * Math.min(1, ratio)));
        int height = Math.max(1, Math.round(842 * Math.min(1, 1 / ratio)));
        PdfDocument.Page page = pdf.startPage(new PdfDocument.PageInfo.Builder(width, height, pageNumber).create());
        try {
            page.getCanvas().drawColor(Color.WHITE);
            RectF bounds = new RectF(0, 0, width, height);
            if (bitmap != null) {
                page.getCanvas().drawBitmap(bitmap, null, bounds, new Paint(Paint.FILTER_BITMAP_FLAG));
            } else {
                svg.renderToCanvas(page.getCanvas(), bounds);
            }
        } finally {
            pdf.finishPage(page);
        }
    }
}
