import requests
import logging
import os
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CourseFetcher:
    """
    Responsibilities:
    1. Fetch course data from the Course Microservice (Java).
    2. Format the data into a text block for the LLM System Prompt.
    3. Provide fallback/mock data if the microservice is down (for resilience).
    """
    
    # URL of your Java Course Service via API Gateway
    # Can be configured via environment variable for deployment
    COURSE_SERVICE_URL = os.getenv("API_GATEWAY_URL", "http://localhost:8080") + "/api/courses"

    def __init__(self):
        self.cached_context = ""

    def get_course_context(self) -> str:
        """
        Main entry point. Returns a formatted string of all courses.
        """
        try:
            courses = self._fetch_from_api()
            return self._format_courses(courses)
        except Exception as e:
            logger.warning(f"Failed to fetch from Course Service: {e}. Using fallback data.")
            return self._get_fallback_data()

    def _fetch_from_api(self) -> List[Dict]:
        """
        Tries to hit the real microservice.
        """
        # Timeout is short because we don't want to block the chat too long
        response = requests.get(self.COURSE_SERVICE_URL, timeout=3)
        response.raise_for_status()
        return response.json()

    def _format_courses(self, courses: List[Dict]) -> str:
        """
        Converts JSON list -> Readable Text Block for the AI.
        """
        if not courses:
            return "No active courses available at the moment."

        text_block = "Here is the list of available courses directly from the database:\n"
        for idx, course in enumerate(courses, 1):
            # Access fields from the actual API response
            title = course.get('title', 'Unknown Title')
            instructor = course.get('instructor', 'Unknown Instructor')
            description = course.get('description', 'No description')
            modules = course.get('modules', [])
            num_modules = len(modules)
            
            # Count total lessons across all modules
            total_lessons = sum(len(module.get('lessons', [])) for module in modules)
            
            text_block += (
                f"{idx}. Course: {title}\n"
                f"   - Instructor: {instructor}\n"
                f"   - Modules: {num_modules} modules with {total_lessons} lessons\n"
                f"   - Description: {description}\n"
            )
        return text_block

    def _get_fallback_data(self) -> str:
        """
        Resilience: If the Java backend is down, the chat shouldn't die. 
        It should at least know about the platform generically.
        """
        return (
            "NOTE: Live course data is currently unavailable (Backend connection failed). "
            "However, here is some general platform info:\n"
            "- Platform Name: DLMS (Decentralized Learning Management System)\n"
            "- Features: Decentralized storage (IPFS), Secure Identity, Expert Instructors.\n"
            "- Contact Support: support@dlms.com"
        )
