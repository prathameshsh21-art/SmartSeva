package com.smartseva.activity.service;

import com.smartseva.activity.dto.ActivityLogDTO;
import com.smartseva.activity.entity.ActivityLog;
import com.smartseva.activity.repository.ActivityLogRepository;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.staff.entity.Staff;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public void logActivity(
            Staff staff,
            ServiceOrder serviceOrder,
            String action,
            String description) {

        ActivityLog activity = ActivityLog.builder()
                .staff(staff)
                .serviceOrder(serviceOrder)
                .action(action)
                .description(description)
                .build();

        activityLogRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getRecentActivities() {

        return activityLogRepository
                .findByOrderByTimestampDesc(PageRequest.of(0, 10))
                .stream()
                .map(activity -> ActivityLogDTO.builder()
                        .activityId(activity.getActivityId())
                        .action(activity.getAction())
                        .description(activity.getDescription())
                        .timestamp(activity.getTimestamp())
                        .serviceId(activity.getServiceOrder() != null
                                ? activity.getServiceOrder().getServiceId()
                                : null)
                        .serviceName(activity.getServiceOrder() != null
                                ? activity.getServiceOrder().getServiceName()
                                : null)
                        .staffId(activity.getStaff() != null
                                ? activity.getStaff().getStaffId()
                                : null)
                        .staffName(activity.getStaff() != null
                                ? activity.getStaff().getFullName()
                                : null)
                        .build())
                .toList();
    }
}