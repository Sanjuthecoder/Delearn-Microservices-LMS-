package com.lms.course.mapper;

import com.lms.course.dto.*;
import com.lms.course.entity.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CourseMapper {

    public static Course toEntity(CourseCreateRequest request) {
        if (request == null)
            return null;

        Course course = new Course();
        course.setCourseId(request.getCourseId());
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setInstructor(request.getInstructor());
        course.setModules(toEntityModules(request.getModules()));
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());

        return course;
    }

    private static List<CourseModule> toEntityModules(List<CourseModuleRequest> moduleRequests) {
        if (moduleRequests == null)
            return null;

        List<CourseModule> modules = new ArrayList<>();
        for (CourseModuleRequest mr : moduleRequests) {
            CourseModule module = new CourseModule();
            module.setTitle(mr.getTitle());
            module.setLessons(toEntityLessons(mr.getLessons()));
            modules.add(module);
        }
        return modules;
    }

    private static List<Lesson> toEntityLessons(List<LessonRequest> lessonRequests) {
        if (lessonRequests == null)
            return null;

        List<Lesson> lessons = new ArrayList<>();
        for (LessonRequest lr : lessonRequests) {
            Lesson lesson = new Lesson();
            lesson.setTitle(lr.getTitle());
            lesson.setType(lr.getType());
            lesson.setMediaId(lr.getMediaId());
            lessons.add(lesson);
        }
        return lessons;
    }

    public static CourseResponse toResponse(Course course) {
        if (course == null)
            return null;

        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setCourseId(course.getCourseId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setFullDescription(course.getFullDescription());
        response.setDuration(course.getDuration());
        response.setLevel(course.getLevel());
        response.setPrerequisites(course.getPrerequisites());
        response.setLearningOutcomes(course.getLearningOutcomes());
        response.setInstructor(course.getInstructor());
        response.setModules(toResponseModules(course.getModules()));
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());

        return response;
    }

    private static List<CourseModuleResponse> toResponseModules(List<CourseModule> modules) {
        if (modules == null)
            return null;

        List<CourseModuleResponse> responseModules = new ArrayList<>();
        for (CourseModule m : modules) {
            CourseModuleResponse mr = new CourseModuleResponse();
            mr.setTitle(m.getTitle());
            mr.setLessons(toResponseLessons(m.getLessons()));
            responseModules.add(mr);
        }
        return responseModules;
    }

    private static List<LessonResponse> toResponseLessons(List<Lesson> lessons) {
        if (lessons == null)
            return null;

        List<LessonResponse> responseLessons = new ArrayList<>();
        for (Lesson l : lessons) {
            LessonResponse lr = new LessonResponse();
            lr.setTitle(l.getTitle());
            lr.setType(l.getType());
            lr.setMediaId(l.getMediaId());
            responseLessons.add(lr);
        }
        return responseLessons;
    }
}
