package com.lms.course.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "media-service")
public interface MediaClient {

    @DeleteMapping("/api/media/{mediaId}")
    void deleteMedia(@PathVariable("mediaId") String mediaId);

    @org.springframework.web.bind.annotation.PutMapping("/api/media/{mediaId}/course/{courseId}")
    void assignCourse(@PathVariable("mediaId") String mediaId, @PathVariable("courseId") String courseId);
}
