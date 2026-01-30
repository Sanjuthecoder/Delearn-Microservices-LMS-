package com.lms.course.entity;

public class Lesson {
    private String id = java.util.UUID.randomUUID().toString();
    private String title;
    private String type;
    private String mediaId;

    public Lesson() {
    }

    public Lesson(String title, String type, String mediaId) {
        this.title = title;
        this.type = type;
        this.mediaId = mediaId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMediaId() {
        return mediaId;
    }

    public void setMediaId(String mediaId) {
        this.mediaId = mediaId;
    }
}
