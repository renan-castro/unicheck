package com.unicheck.unicheck.service;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.unicheck.unicheck.model.Attendance;
import com.unicheck.unicheck.repository.AttendanceRepository;

@Service
public class AttendanceService {
    
    @Autowired
    AttendanceRepository repository;

    @Autowired
    SimpMessagingTemplate messagingTemplate;

    private final Set<String> activeClasses = new java.util.HashSet<>();

    public Attendance registerAttendance(Attendance attendance) {
        attendance.setDateTime(java.time.LocalDateTime.now());
        Attendance savedAttendance = repository.save(attendance);

        messagingTemplate.convertAndSend("/topics/attendances/" + attendance.getClassId(), savedAttendance);
        return savedAttendance;
    }

    public String startClass(String classId) {  
        activeClasses.add(classId);
        return classId;
    }

    public String endClass(String classId) {
        activeClasses.remove(classId);
        return classId;
    }

    
    public List<Attendance> findByClassId(String classId) {
        return repository.findByClassId(classId);
    }

}
