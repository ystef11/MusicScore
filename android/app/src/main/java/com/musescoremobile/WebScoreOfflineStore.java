package com.musescoremobile;

import android.content.Context;
import android.net.Uri;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

final class WebScoreOfflineStore {
    private WebScoreOfflineStore() { }

    private static String scoreId(String key) { return key.substring(0, key.indexOf('-')); }

    static File manifestFile(Context context, String key) {
        return new File(context.getFilesDir(), "OfflineWebScores/" + scoreId(key) + ".webscore");
    }

    static String savedSourceUrl(Context context, String key) {
        try {
            return read(manifestFile(context, key)).optString("sourceUrl");
        } catch (Exception ignored) {
            return "";
        }
    }

    static File mediaRoot(Context context, boolean offline) {
        return new File(offline ? context.getFilesDir() : context.getCacheDir(),
            offline ? "OfflineWebScoreMedia" : "WebScoreMedia");
    }

    static void requireComplete(JSONObject score) throws Exception {
        JSONArray pages = score.getJSONArray("pages");
        JSONObject metadata = score.optJSONObject("metadata");
        if (pages.length() == 0 || (metadata != null && metadata.optInt("pages") > pages.length())) {
            throw new IOException("Загрузились не все страницы партитуры");
        }
        for (int i = 0; i < pages.length(); i++) {
            if (!hasMedia(pages.optString(i))) {
                throw new IOException("Загрузились не все страницы партитуры");
            }
        }
        if ((score.optBoolean("audioExpected") || !score.isNull("audioUrl"))
                && !hasMedia(score.optString("audioUrl"))) {
            throw new IOException("Не загрузилось аудио партитуры");
        }
    }

    static String save(Context context, String key, File source) throws Exception {
        JSONObject score = read(source);
        requireComplete(score);
        File target = manifestFile(context, key);
        File root = mediaRoot(context, true);
        File directory = new File(root, scoreId(key) + "/" + UUID.randomUUID());
        Set<File> oldMedia = referencedDirectories(target, root);
        try {
            Files.createDirectories(directory.toPath());
            Files.createDirectories(target.getParentFile().toPath());
            JSONArray pages = score.getJSONArray("pages");
            File cache = mediaRoot(context, false);
            for (int i = 0; i < pages.length(); i++) {
                pages.put(i, copyMedia(cache, directory, pages.getString(i), "page-" + i));
            }
            for (String field : new String[]{"audioUrl", "midiUrl"}) {
                String url = score.optString(field);
                if (url.startsWith("file:")) score.put(field, copyMedia(cache, directory, url, field));
            }
            writeManifest(target, score);
        } catch (Exception error) {
            deleteTree(directory);
            throw error;
        }
        oldMedia.forEach(WebScoreOfflineStore::deleteTree);
        return target.getAbsolutePath();
    }

    static void writeManifest(File target, JSONObject score) throws Exception {
        score.put("canAutoRetry", false);
        score.put("finished", true);
        score.put("pagesDone", true);
        Files.createDirectories(target.getParentFile().toPath());
        File staged = File.createTempFile("score-", ".new", target.getParentFile());
        try {
            Files.write(staged.toPath(), score.toString().getBytes(StandardCharsets.UTF_8));
            Files.move(staged.toPath(), target.toPath(),
                StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        } finally {
            staged.delete();
        }
    }

    static void remove(Context context, String key, boolean offline) throws Exception {
        File root = mediaRoot(context, offline);
        if (offline) {
            Files.deleteIfExists(manifestFile(context, key).toPath());
            deleteTree(new File(root, scoreId(key)));
            return;
        }
        File parent = WebScoreMediaCache.cacheFile(context, key).getParentFile();
        File[] files = parent.listFiles(file -> file.getName().matches(scoreId(key) + "-[0-9]+\\.webscore"));
        if (files == null) return;
        for (File file : files) {
            Set<File> media = referencedDirectories(file, root);
            Files.deleteIfExists(file.toPath());
            media.forEach(WebScoreOfflineStore::deleteTree);
        }
        File[] directories = root.listFiles(file -> file.isDirectory()
            && file.getName().matches(scoreId(key) + "-[0-9]+"));
        if (directories != null) for (File directory : directories) deleteTree(directory);
    }

    static JSONObject read(File file) throws Exception {
        return new JSONObject(new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8));
    }

    private static Set<File> referencedDirectories(File file, File root) {
        Set<File> result = new HashSet<>();
        try {
            JSONObject score = read(file);
            JSONArray pages = score.getJSONArray("pages");
            for (int i = 0; i < pages.length(); i++) addDirectory(result, root, pages.optString(i));
            for (String field : new String[]{"audioUrl", "midiUrl"}) addDirectory(result, root, score.optString(field));
        } catch (Exception ignored) { }
        return result;
    }

    private static void addDirectory(Set<File> result, File root, String url) throws IOException {
        if (!url.startsWith("file:")) return;
        File directory = localFile(url).getCanonicalFile().getParentFile();
        if (directory != null && directory.getPath().startsWith(root.getCanonicalPath() + File.separator)) {
            result.add(directory);
        }
    }

    private static String copyMedia(File root, File directory, String url, String name) throws IOException {
        File source = localFile(url).getCanonicalFile();
        if (!source.getPath().startsWith(root.getCanonicalPath() + File.separator) || !source.isFile()) {
            throw new IOException("Файл партитуры недоступен");
        }
        File target = new File(directory, name + "-" + source.getName());
        Files.copy(source.toPath(), target.toPath());
        return Uri.fromFile(target).toString();
    }

    private static boolean hasMedia(String url) {
        File file = localFile(url);
        return file.isFile() && file.length() > 0;
    }

    private static File localFile(String value) {
        Uri uri = Uri.parse(value);
        return "file".equals(uri.getScheme()) && uri.getPath() != null ? new File(uri.getPath()) : new File("");
    }

    static void deleteTree(File file) {
        File[] children = file.listFiles();
        if (children != null) for (File child : children) deleteTree(child);
        file.delete();
    }
}
