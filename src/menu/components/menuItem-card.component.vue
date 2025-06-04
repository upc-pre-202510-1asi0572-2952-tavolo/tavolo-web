<!-- src/menu/components/menuItem-card.component.vue -->
<script setup>
import { computed } from 'vue';

const props = defineProps({
  menuItem: {
    type: Object,
    required: true
  }
});

const formattedPrice = computed(() => {
  return `S/ ${props.menuItem.price.toFixed(2)}`;
});

</script>

<template>
  <div class="menu-item-card">
    <div class="menu-item-image">
      <img :src="menuItem.imageBase64" :alt="menuItem.name" v-if="menuItem.imageBase64"/>
      <div class="no-image" v-else>
        <i class="pi pi-image"></i>
      </div>
    </div>

    <div class="menu-item-content">
      <div class="menu-item-info">
        <h3 class="menu-item-title">{{ menuItem.name }}</h3>
        <p class="menu-item-description">{{ menuItem.description }}</p>
      </div>
      <div class="menu-item-price">{{ formattedPrice }}</div>
    </div>
  </div>
</template>

<style scoped>
.menu-item-card {
  background-color: rgba(186, 108, 45, 0.06);

  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  height: 120px;
  width: 100%;
}

.menu-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.menu-item-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  overflow: hidden;
}

.menu-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.menu-item-card:hover .menu-item-image img {
  transform: scale(1.05);
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F5F5F5;
  color: #D0D0D0;
  font-size: 2rem;
}

.menu-item-content {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.menu-item-info {
  flex-grow: 1;
  padding-right: 16px;
}

.menu-item-title {
  margin: 0 0 6px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.menu-item-description {
  color: #777;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.menu-item-price {
  background-color: #D4B896;
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .menu-item-card {
    height: 100px;
  }

  .menu-item-image {
    width: 100px;
    height: 100px;
  }

  .menu-item-content {
    padding: 12px;
  }

  .menu-item-info {
    padding-right: 12px;
  }

  .menu-item-title {
    font-size: 1rem;
  }

  .menu-item-description {
    font-size: 0.85rem;
  }

  .menu-item-price {
    font-size: 0.85rem;
    padding: 5px 10px;
  }
}
</style>