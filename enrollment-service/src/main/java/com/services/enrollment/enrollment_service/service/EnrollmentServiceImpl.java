package com.services.enrollment.enrollment_service.service;

import com.services.enrollment.enrollment_service.dto.EnrollmentRequest;
import com.services.enrollment.enrollment_service.entity.Enrollment;
import com.services.enrollment.enrollment_service.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentServiceImpl(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    public Enrollment enrollStudent(EnrollmentRequest request) {
        // Check if already enrolled
        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(request.getUserId(),
                request.getCourseId());
        if (existing.isPresent()) {
            return existing.get();
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUserId(request.getUserId());
        enrollment.setCourseId(request.getCourseId());
        enrollment.setStatus("ENROLLED");
        enrollment.setEnrolledAt(LocalDateTime.now());

        return enrollmentRepository.save(enrollment);
    }

    @Override
    public List<Enrollment> getUserEnrollments(String userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    @Override
    public boolean markCourseComplete(String userId, String courseId) {
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (enrollmentOpt.isPresent()) {
            Enrollment enrollment = enrollmentOpt.get();
            enrollment.setStatus("COMPLETED");
            enrollmentRepository.save(enrollment);
            return true;
        }
        return false;
    }

    @Override
    public Enrollment updateProgress(String userId, String courseId, List<String> completedLessons, Integer progress) {
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (enrollmentOpt.isPresent()) {
            Enrollment enrollment = enrollmentOpt.get();
            enrollment.setCompletedLessons(completedLessons);
            enrollment.setProgress(progress);

            // Auto-mark as completed if progress reaches 100%
            if (progress != null && progress >= 100) {
                enrollment.setStatus("COMPLETED");
            }

            return enrollmentRepository.save(enrollment);
        }
        return null;
    }
}
