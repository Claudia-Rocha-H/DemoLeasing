package com.bancolombia.leasing.infrastructure.adapter.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SpringDataRequestRepository extends JpaRepository<RequestJpaEntity, String> {
	List<RequestJpaEntity> findAllByOrderByFiledAtDesc();

	@Query(
		value = """
			select coalesce(max(cast(substring(r.request_id from '[0-9]+$') as integer)), 0)
			from leasing.requests r
			where r.request_id like 'REQ-%'
			""",
		nativeQuery = true
	)
	Integer findMaxRequestNumericId();
}
