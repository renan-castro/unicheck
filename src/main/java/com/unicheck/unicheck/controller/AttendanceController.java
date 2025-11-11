package com.unicheck.unicheck.controller;

import com.unicheck.unicheck.repository.AttendanceRepository;
import com.unicheck.unicheck.service.AttendanceService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.unicheck.unicheck.model.Attendance;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("api/attendances")
@Controller
public class AttendanceController {
    
    @Autowired
    AttendanceService attendanceService;

    @GetMapping
    public List<Attendance> getAttendancesById(@RequestParam(required = false) String classId) {
        return attendanceService.findByClassId(classId);
    }

    @PostMapping("/register")
    public Attendance register(@RequestBody Attendance attendance) {
        return attendanceService.registerAttendance(attendance);
    }

    @PostMapping("/startClass")
    public String startClass(@RequestParam String classId) {
        return attendanceService.startClass(classId);
    }
    
    @PostMapping("/endClass")
    public String endClass(@RequestParam String classId) {
        return attendanceService.endClass(classId); 
    }
}
