package com.musescoremobile;

import android.content.Context;
import android.net.Uri;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.zip.CRC32;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;
import org.json.JSONArray;
import org.json.JSONObject;

final class OfflineScoreArchive {
    private static final String SUFFIX = ".mscoreoffline.zip";
    private static final String INDEX = "score.json";
    private static final String SCORE_EXTENSIONS = "mscz|mscze|pdf|pdfe";
    private static final String PAGE_EXTENSIONS = "svg|png";
    private static final String[] MEDIA_FIELDS = {"audioUrl", "midiUrl"};
    private static final String[] MEDIA_EXTENSIONS = {"mp3|m4a|ogg|wav|flac", "mid|midi"};
    private static final String[] VIEW_FIELDS = {
        "title", "version", "metadata", "customAudio", "audioExpected", "midiData", "syncResponses"
    };
    private static final long MAX_ARCHIVE = 300L * 1024 * 1024;
    private static final long MAX_INDEX = 8 * 1024 * 1024;
    private static final int MAX_PAGES = 512;

    private OfflineScoreArchive() { }

    static SaveDocumentModule.SaveFile exportScore(Context context, String path, String infoJson) throws Exception {
        File source = new File(path).getCanonicalFile();
        String extension = extension(source);
        File files = context.getFilesDir().getCanonicalFile();
        File cache = context.getCacheDir().getCanonicalFile();
        File parent = source.getParentFile();
        JSONObject index = scoreInfo(new JSONObject(infoJson));
        index.put("version", 1);
        File archive = File.createTempFile("offline-score-", ".zip", context.getCacheDir());
        try (ZipOutputStream zip = new ZipOutputStream(Files.newOutputStream(archive.toPath()))) {
            if ("webscore".equals(extension)) {
                boolean saved = new File(files, "OfflineWebScores").equals(parent);
                if (!saved) {
                    if (!new File(cache, "WebScores").equals(parent)
                            || !source.getName().matches("[0-9]+-[0-9]+[.]webscore")) throw invalid();
                    String key = source.getName().substring(0, source.getName().lastIndexOf('.'));
                    // The reader can open while later pages or audio are still downloading.
                    // An existing complete cache may remain usable after a failed refresh.
                    WebScoreMediaCache.finished(context, key).handle((pathResult, error) -> null).get();
                }
                File media = WebScoreOfflineStore.mediaRoot(context, saved).getCanonicalFile();
                index.put("view", exportWebScore(source, media, zip));
            } else {
                if ((!files.equals(parent) && !new File(cache, "Cached").equals(parent))
                        || !extension.matches(SCORE_EXTENSIONS)) throw invalid();
                String entry = "music." + extension;
                writeFile(zip, entry, source);
                index.put("music", entry);
            }
            byte[] info = index.toString().getBytes(StandardCharsets.UTF_8);
            if (info.length > MAX_INDEX) throw invalid();
            zip.putNextEntry(new ZipEntry(INDEX));
            zip.write(info);
            zip.closeEntry();
        } catch (Exception error) {
            archive.delete();
            throw error;
        }
        try (ZipFile zip = new ZipFile(archive)) {
            if (archive.length() > MAX_ARCHIVE) throw invalid();
            validateEntries(zip);
        } catch (Exception error) {
            archive.delete();
            throw error;
        }
        String name = index.getString("title").replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]+", "_").trim();
        if (name.isEmpty()) name = "Score";
        name = name.substring(0, name.offsetByCodePoints(0, Math.min(65, name.codePointCount(0, name.length()))));
        return new SaveDocumentModule.SaveFile(archive, name + SUFFIX, "application/zip", true);
    }

    private static JSONObject exportWebScore(File source, File mediaRoot, ZipOutputStream zip) throws Exception {
        JSONObject saved = WebScoreOfflineStore.read(source);
        WebScoreOfflineStore.requireComplete(saved);
        JSONObject view = portableView(saved);
        JSONArray sourcePages = saved.getJSONArray("pages");
        if (sourcePages.length() > MAX_PAGES) throw invalid();
        JSONArray pages = new JSONArray();
        for (int i = 0; i < sourcePages.length(); i++) {
            pages.put(writeMedia(zip, mediaRoot, sourcePages.getString(i), "page-" + i, PAGE_EXTENSIONS));
        }
        view.put("pages", pages);
        for (int i = 0; i < MEDIA_FIELDS.length; i++) {
            String field = MEDIA_FIELDS[i];
            if (!saved.isNull(field)) {
                view.put(field, writeMedia(zip, mediaRoot, saved.getString(field), field, MEDIA_EXTENSIONS[i]));
            }
        }
        return view;
    }

    private static String writeMedia(ZipOutputStream zip, File root, String url, String stem, String extensions)
            throws Exception {
        Uri uri = Uri.parse(url);
        if (!"file".equals(uri.getScheme()) || uri.getPath() == null) throw invalid();
        File source = new File(uri.getPath()).getCanonicalFile();
        String extension = extension(source);
        if (!source.getPath().startsWith(root.getPath() + File.separator)) throw invalid();
        // Older cached MIDI files were saved with a page extension.
        if ("midiUrl".equals(stem) && "svg".equals(extension)) extension = "mid";
        if (!extension.matches(extensions)) throw invalid();
        String name = stem + "." + extension;
        writeFile(zip, name, source);
        return name;
    }

    private static void writeFile(ZipOutputStream zip, String name, File source) throws IOException {
        if (!source.isFile() || source.length() == 0) throw invalid();
        zip.putNextEntry(new ZipEntry(name));
        try (InputStream input = Files.newInputStream(source.toPath())) {
            copy(input, zip, MAX_ARCHIVE, null);
        }
        zip.closeEntry();
    }

    static JSONObject importScore(Context context, Uri uri) throws Exception {
        if (!"content".equals(uri.getScheme()) && !"file".equals(uri.getScheme())) throw invalid();
        File staged = File.createTempFile("offline-import-", ".zip", context.getCacheDir());
        try {
            try (InputStream input = context.getContentResolver().openInputStream(uri);
                 OutputStream output = Files.newOutputStream(staged.toPath())) {
                if (input == null) throw invalid();
                copy(input, output, MAX_ARCHIVE, null);
            }
            return install(context, staged);
        } finally {
            staged.delete();
        }
    }

    private static JSONObject install(Context context, File archive) throws Exception {
        try (ZipFile zip = new ZipFile(archive)) {
            validateEntries(zip);
            ByteArrayOutputStream data = new ByteArrayOutputStream();
            readEntry(zip, INDEX, data, MAX_INDEX);
            JSONObject index = new JSONObject(new String(data.toByteArray(), StandardCharsets.UTF_8));
            if (index.optInt("version") != 1) throw invalid();
            JSONObject info = scoreInfo(index);
            // Isolate imported files from catalog IDs and existing library copies.
            long id = (UUID.randomUUID().getLeastSignificantBits() & ((1L << 48) - 1)) | (1L << 48);
            info.put("id", id);
            JSONObject view = index.optJSONObject("view");
            if (view != null) {
                importWebScore(context, zip, view, id);
                info.put("webScoreSaved", true);
            } else {
                String name = index.optString("music");
                if (!name.matches("music[.](" + SCORE_EXTENSIONS + ")")) throw invalid();
                File files = context.getFilesDir();
                File target = new File(files, id + "." + name.substring(name.indexOf('.') + 1));
                File temp = File.createTempFile("score-", ".new", files);
                try {
                    extract(zip, name, temp);
                    Files.move(temp.toPath(), target.toPath(), StandardCopyOption.ATOMIC_MOVE);
                } finally {
                    temp.delete();
                }
                info.put("isPdf", name.endsWith(".pdf") || name.endsWith(".pdfe"));
            }
            return info;
        }
    }

    private static void importWebScore(Context context, ZipFile zip, JSONObject saved, long id) throws Exception {
        JSONArray sourcePages = saved.getJSONArray("pages");
        if (sourcePages.length() == 0 || sourcePages.length() > MAX_PAGES) throw invalid();
        File directory = new File(WebScoreOfflineStore.mediaRoot(context, true), id + "/" + UUID.randomUUID());
        JSONObject view = portableView(saved);
        try {
            Files.createDirectories(directory.toPath());
            JSONArray pages = new JSONArray();
            for (int i = 0; i < sourcePages.length(); i++) {
                pages.put(extractMedia(zip, directory, sourcePages.getString(i), "page-" + i, PAGE_EXTENSIONS));
            }
            view.put("pages", pages);
            view.put("importedFromArchive", true);
            for (int i = 0; i < MEDIA_FIELDS.length; i++) {
                String field = MEDIA_FIELDS[i];
                if (!saved.isNull(field)) {
                    view.put(field, extractMedia(zip, directory, saved.getString(field), field, MEDIA_EXTENSIONS[i]));
                }
            }
            WebScoreOfflineStore.requireComplete(view);
            WebScoreOfflineStore.writeManifest(WebScoreOfflineStore.manifestFile(context, id + "-0"), view);
        } catch (Exception error) {
            WebScoreOfflineStore.deleteTree(directory);
            throw error;
        }
    }

    private static String extractMedia(ZipFile zip, File directory, String name, String stem, String extensions)
            throws IOException {
        if (!name.matches(stem + "[.](" + extensions + ")")) throw invalid();
        File target = new File(directory, name);
        extract(zip, name, target);
        return Uri.fromFile(target).toString();
    }

    private static void validateEntries(ZipFile zip) throws IOException {
        if (zip.size() > MAX_PAGES + MEDIA_FIELDS.length + 1) throw invalid();
        long total = 0;
        Set<String> names = new HashSet<>();
        var entries = zip.entries();
        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            long length = entry.getSize();
            if (entry.isDirectory() || !names.add(entry.getName())
                    || length <= 0 || length > MAX_ARCHIVE - total) throw invalid();
            total += length;
        }
    }

    private static void extract(ZipFile zip, String name, File target) throws IOException {
        try (OutputStream output = Files.newOutputStream(target.toPath())) {
            readEntry(zip, name, output, MAX_ARCHIVE);
        }
    }

    private static void readEntry(ZipFile zip, String name, OutputStream target, long limit) throws IOException {
        ZipEntry entry = zip.getEntry(name);
        if (entry == null || entry.getSize() > limit) throw invalid();
        CRC32 checksum = new CRC32();
        try (InputStream input = zip.getInputStream(entry)) {
            if (copy(input, target, entry.getSize(), checksum) != entry.getSize()
                    || checksum.getValue() != entry.getCrc()) throw invalid();
        }
    }

    private static long copy(InputStream input, OutputStream output, long limit, CRC32 checksum) throws IOException {
        byte[] buffer = new byte[32768];
        long length = 0;
        int count;
        while ((count = input.read(buffer)) != -1) {
            length += count;
            if (length > limit) throw invalid();
            output.write(buffer, 0, count);
            if (checksum != null) checksum.update(buffer, 0, count);
        }
        return length;
    }

    private static JSONObject scoreInfo(JSONObject input) throws Exception {
        JSONObject info = new JSONObject();
        info.put("title", input.optString("title", "Score"));
        info.put("authorName", input.optString("authorName"));
        long catalogId = input.optLong("catalogScoreId");
        if (catalogId > 0 && catalogId < (1L << 48)) info.put("catalogScoreId", catalogId);
        return info;
    }

    private static JSONObject portableView(JSONObject source) throws Exception {
        JSONObject target = new JSONObject();
        for (String field : VIEW_FIELDS) {
            if (!source.isNull(field)) target.put(field, source.get(field));
        }
        Uri url = WebScoreMediaCache.scorePage(source.optString("sourceUrl"));
        if (url != null) target.put("sourceUrl", url.toString());
        return target;
    }

    private static String extension(File file) {
        String name = file.getName();
        return name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private static IOException invalid() {
        return new IOException("Файл офлайн-партитуры недоступен или повреждён.");
    }
}
