package com.smartseva.security.userdetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartseva.staff.entity.Staff;
import com.smartseva.staff.entity.StaffStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@AllArgsConstructor
@Getter
public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    @JsonIgnore
    private String password;
    private StaffStatus status;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserDetailsImpl build(Staff staff) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(staff.getRole().name())
        );

        return new UserDetailsImpl(
                staff.getStaffId(),
                staff.getUsername(),
                staff.getFullName(),
                staff.getEmail(),
                staff.getPassword(),
                staff.getStatus(),
                authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status == StaffStatus.ACTIVE;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == StaffStatus.ACTIVE;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}