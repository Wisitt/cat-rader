import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class UploadsService {
  private readonly client?: SupabaseClient;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>("SUPABASE_BUCKET") ?? "petradar-uploads";
    const url = config.get<string>("SUPABASE_URL");
    const key = config.get<string>("SUPABASE_SERVICE_ROLE_KEY");
    if (url && key) {
      this.client = createClient(url, key);
    }
  }

  async createSignedPhotoUpload(fileName: string) {
    if (!this.client) {
      throw new ServiceUnavailableException("Supabase storage is not configured");
    }

    const safeName = fileName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
    const path = `photos/${Date.now()}-${safeName}`;
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUploadUrl(path);
    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    const publicUrl = this.client.storage.from(this.bucket).getPublicUrl(path).data.publicUrl;
    return {
      path,
      signedUrl: data.signedUrl,
      token: data.token,
      publicUrl,
    };
  }
}
