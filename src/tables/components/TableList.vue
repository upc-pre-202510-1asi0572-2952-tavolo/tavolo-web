<script setup>
import { ref, defineProps } from 'vue';
import TableCard from './TableCard.vue';

const props = defineProps({
  tables: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['delete']);

const handleDelete = (tableId) => {
  emit('delete', tableId);
};
</script>

<template>
  <div class="table-list" :class="{ 'empty': tables.length === 0 }">
    <div v-if="tables.length === 0" class="empty-state">
      <p>No hay mesas registradas</p>
    </div>
    <div v-else class="table-grid">
      <TableCard
        v-for="table in tables"
        :key="table.id"
        :table="table"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style scoped>
.table-list {
  width: 100%;
  min-height: 200px;
  color: #333333; /* Color oscuro para el texto */
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f8f8f8;
  border-radius: 5px;
  border: 1px dashed #ccc;
}

.empty-state p {
  font-size: 16px;
  color: #666;
}
</style>