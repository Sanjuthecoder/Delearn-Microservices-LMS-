package com.dlms.mediaservice.controller;

import com.dlms.mediaservice.model.MediaMetadata;
import com.dlms.mediaservice.repository.MediaRepository;
import com.dlms.mediaservice.service.StorageProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private MediaRepository repository;

    // We can inject the interface. Spring will find the IPFS implementation.
    @Autowired
    private StorageProvider storage;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        // Basic Role Check - Security should ideally be handled by Gateway, but this is
        // a second line of defense
        if (role != null && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            System.out.println("=== UPLOAD REQUEST RECEIVED ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());

            String cid = storage.uploadFile(file);
            System.out.println("IPFS CID: " + cid);

            MediaMetadata meta = new MediaMetadata();
            meta.setFileName(file.getOriginalFilename());
            meta.setContentType(file.getContentType());
            meta.setContentIdentifier(cid);
            meta.setStorageProvider("IPFS");
            meta.setSize(file.getSize());

            MediaMetadata saved = repository.save(meta);
            System.out.println("Saved to MongoDB with ID: " + saved.getMediaId());

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("=== UPLOAD ERROR ===");
            e.printStackTrace();
            // DEBUG: Write error to file so we can see it
            try (java.io.PrintWriter pw = new java.io.PrintWriter(
                    new java.io.FileWriter("d:\\DLMS\\media_upload_error.txt", true))) {
                pw.println("=== ERROR AT " + java.time.LocalDateTime.now() + " ===");
                e.printStackTrace(pw);
                pw.println("--------------------------------------------------");
            } catch (java.io.IOException ioe) {
                ioe.printStackTrace();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage(), "type", e.getClass().getName()));
        }
    }

    @GetMapping("/{mediaId}")
    public ResponseEntity<String> getStreamUrl(@PathVariable String mediaId) {
        MediaMetadata meta = repository.findById(mediaId).orElseThrow(() -> new RuntimeException("Media not found"));
        return ResponseEntity.ok(storage.getAccessUrl(meta.getContentIdentifier()));
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<?> deleteMedia(@PathVariable String mediaId) {
        if (repository.existsById(mediaId)) {
            repository.deleteById(mediaId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/download/{mediaId}")
    public ResponseEntity<Void> downloadMedia(@PathVariable String mediaId) {
        MediaMetadata meta = repository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found"));
        String accessUrl = storage.getAccessUrl(meta.getContentIdentifier());
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(java.net.URI.create(accessUrl))
                .build();
    }

    @PutMapping("/{mediaId}/course/{courseId}")
    public ResponseEntity<?> assignCourse(@PathVariable String mediaId, @PathVariable String courseId) {
        return repository.findById(mediaId)
                .map(media -> {
                    media.setCourseId(courseId);
                    repository.save(media);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
