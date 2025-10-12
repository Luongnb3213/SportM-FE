export type CloudinaryUploadResult = {
    asset_id: string;
    public_id: string;
    secure_url: string;
    url: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
    // ... còn nhiều field khác Cloudinary trả về
};

export function guessMimeType(uriOrName: string) {
    const lower = uriOrName.split("?")[0].toLowerCase();
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    return "image/jpeg"; // fallback
}

type UploadSource = string | File | Blob;

/**
 * Upload file từ local uri (Expo ImagePicker) hoặc File/Blob (web) lên Cloudinary bằng unsigned preset
 */
export async function uploadToCloudinary(
    source: UploadSource,
    opts: {
        folder?: string; // vd: 'mobile_uploads'
        publicId?: string; // nếu muốn đặt tên file (không cần đuôi)
        tags?: string[]; // gắn tags
        context?: Record<string, string>; // gắn metadata
    } = {},
): Promise<CloudinaryUploadResult> {
    const { folder, publicId, tags, context } = opts;
    const cloudName = "diuwaesix";
    const unsignedPreset = "sportM";

    const form = new FormData();

    const FileCtor = typeof File === "undefined" ? undefined : File;
    const BlobCtor = typeof Blob === "undefined" ? undefined : Blob;

    if (typeof source === "string") {
        const mime = guessMimeType(source);
        const reactNativeFile: { uri: string; name: string; type: string } = {
            uri: source,
            name: "upload.jpg",
            type: mime,
        };
        form.append("file", reactNativeFile as unknown as Blob);
    } else if (FileCtor && source instanceof FileCtor) {
        const type = source.type || guessMimeType(source.name);
        form.append("file", source, source.name || `upload.${type.split("/")[1] ?? "jpg"}`);
    } else if (BlobCtor && source instanceof BlobCtor) {
        form.append("file", source, "upload.jpg");
    } else {
        throw new Error("Unsupported upload source for Cloudinary");
    }

    form.append("upload_preset", unsignedPreset);
    if (folder) form.append("folder", folder);
    if (publicId) form.append("public_id", publicId);
    if (tags?.length) form.append("tags", tags.join(","));
    if (context) {
        // context format: key=value|key2=value2
        const ctx = Object.entries(context)
            .map(([k, v]) => `${k}=${v}`)
            .join("|");
        if (ctx) form.append("context", ctx);
    }

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Cloudinary upload failed: ${res.status} ${errText}`);
    }

    const json = (await res.json()) as CloudinaryUploadResult;
    return json;
}
