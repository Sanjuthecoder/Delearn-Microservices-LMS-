package com.services.enrollment.enrollment_service.controller;

import com.services.enrollment.enrollment_service.dto.EnrollmentRequest;
import com.services.enrollment.enrollment_service.entity.Enrollment;
import com.services.enrollment.enrollment_service.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<Enrollment> enrollStudent(@RequestBody EnrollmentRequest request) {
        Enrollment enrollment = enrollmentService.enrollStudent(request);
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Enrollment>> getUserEnrollments(
            @RequestParam String userId,
            @RequestParam(required = false) String courseId) {

        List<Enrollment> enrollments = enrollmentService.getUserEnrollments(userId);

        // If courseId is provided, filter to check if user is enrolled in specific
        // course
        if (courseId != null && !courseId.isEmpty()) {
            enrollments = enrollments.stream()
                    .filter(e -> courseId.equals(e.getCourseId()))
                    .collect(java.util.stream.Collectors.toList());
        }

        return ResponseEntity.ok(enrollments);
    }

    @PutMapping("/complete")
    public ResponseEntity<String> markCourseComplete(@RequestParam String userId, @RequestParam String courseId) {
        boolean success = enrollmentService.markCourseComplete(userId, courseId);
        if (success) {
            return ResponseEntity.ok("Course marked as completed");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Enrollment not found");
    }

    @PutMapping("/progress")
    public ResponseEntity<Enrollment> updateProgress(
            @RequestParam String userId,
            @RequestParam String courseId,
            @RequestBody java.util.Map<String, Object> progressData) {

        @SuppressWarnings("unchecked")
        List<String> completedLessons = (List<String>) progressData.get("completedLessons");
        Integer progress = (Integer) progressData.get("progress");

        Enrollment updated = enrollmentService.updateProgress(userId, courseId, completedLessons, progress);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
