import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
    // Future migrations will be added here when schema changes
    // Example:
    // {
    //   toVersion: 2,
    //   steps: [
    //     createTable({
    //       name: 'new_table',
    //       columns: [
    //         { name: 'field1', type: 'string' },
    //         { name: 'field2', type: 'number' },
    //       ]
    //     }),
    //     addColumns({
    //       table: 'existing_table',
    //       columns: [
    //         { name: 'new_field', type: 'boolean', isOptional: true },
    //       ]
    //     })
    //   ]
    // }
  ],
})