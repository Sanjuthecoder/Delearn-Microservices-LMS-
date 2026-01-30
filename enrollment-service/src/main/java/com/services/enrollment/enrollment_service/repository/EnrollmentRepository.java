package com.services.enrollment.enrollment_service.repository;

import com.services.enrollment.enrollment_service.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(String userId);

    Optional<Enrollment> findByUserIdAndCourseId(String userId, String courseId);
}
