import React, { useState } from 'react';

import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';

import ServiceTable from '../components/ServiceTable';

export default function ServiceList() {

  const [search, setSearch] = useState('');

  const services = [];

  return (
    <div>

      <div className="d-flex justify-content-between align-items-center mb-3">

        <h3 className="fw-bold">
          Service Orders
        </h3>

      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search service..."
      />

      <ServiceTable
        services={services}
      />

      <Pagination
        page={0}
        totalPages={1}
        onPageChange={() => {}}
      />

    </div>
  );
}