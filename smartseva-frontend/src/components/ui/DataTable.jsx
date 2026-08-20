import React from 'react';

export default function DataTable({
    columns = [],
    data = []
}) {

    return (

        <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

                <thead className="table-light">

                    <tr>

                        {columns.map((column) => (

                            <th key={column.key}>
                                {column.label}
                            </th>

                        ))}

                    </tr>

                </thead>

                <tbody>

                    {data.length > 0 ? (

                        data.map((row, index) => (

                            <tr key={index}>

                                {columns.map((column) => (

                                    <td key={column.key}>
                                        {row[column.key]}
                                    </td>

                                ))}

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan={columns.length}
                                className="text-center text-muted"
                            >
                                No records found
                            </td>

                        </tr>

                    )}

                </tbody>

            </table>

        </div>

    );

}