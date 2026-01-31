package com.dlms.mediaservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "media_metadata")
@Data
public class MediaMetadata {
    @Id
    private String mediaId;
    private String fileName;
    private String contentType;
    private long size;
    private String storageProvider; // e.g., "IPFS" or "S3"
    private String contentIdentifier; // The CID hash for IPFS or Key for S3
    private String uploadedBy; // Admin ID
    private String courseId; // Linked Course ID
    private LocalDateTime createdAt = LocalDateTime.now();

    // Additional field for independent model adaptation can be added here
}
