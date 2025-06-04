<!-- src/menu/pages/menu-list.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { MenuService } from '../service/menu.service';
import MenuItemCardComponent from '../components/menuItem-card.component.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const menuService = new MenuService();
const loading = ref(true);
const menuItems = ref([]);
const activeTabIndex = ref(0);
const cafeteriaName = ref('Cafetería El Aroma');
const slogan = ref('Sabores que inspiran momentos');

const categories = [
  { label: 'Entradas', value: 'ENTRADAS' },
  { label: 'Platos Principales', value: 'PLATOS_PRINCIPALES' },
  { label: 'Postres', value: 'POSTRES' },
  { label: 'Bebidas', value: 'BEBIDAS' }
];

const getCategoryByIndex = (index) => {
  return categories[index].value;
};

const getItemsByCategory = (categoryValue) => {
  return menuItems.value.filter(item => item.category === categoryValue);
};

const fetchMenuItems = async () => {
  try {
    loading.value = true;
    const response = await menuService.getAllMenuItems();
    menuItems.value = response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
  } finally {
    loading.value = false;
  }
};

const fetchMenuItemsByCategory = async (category) => {
  try {
    loading.value = true;
    const response = await menuService.getMenuItemsByCategory(category);
    // Actualizar solo los elementos de esta categoría
    const otherCategories = menuItems.value.filter(item => item.category !== category);
    menuItems.value = [...otherCategories, ...response.data];
  } catch (error) {
    console.error(`Error fetching menu items for category ${category}:`, error);
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (e) => {
  activeTabIndex.value = e.index;
  const categoryValue = getCategoryByIndex(e.index);
  fetchMenuItemsByCategory(categoryValue);
};

onMounted(async () => {
  await fetchMenuItems();
  // Cargar datos para la categoría inicial
  fetchMenuItemsByCategory(getCategoryByIndex(activeTabIndex.value));
});
</script>

<template>
  <div class="menu-container">
    <div class="menu-header">
      <h1 class="cafeteria-name">{{ cafeteriaName }}</h1>
      <p class="cafeteria-slogan">{{ slogan }}</p>
    </div>

    <div class="menu-tab-container">
      <TabView :activeIndex="activeTabIndex" @tab-change="handleTabChange">
        <TabPanel v-for="(category, index) in categories" :key="index" :header="category.label">
          <transition name="fade-slide" mode="out-in">
            <!-- Indicador de carga -->
            <div class="loading-indicator" v-if="loading">
              <i class="pi pi-spin pi-spinner"></i> Cargando...
            </div>
            <!-- Lista de productos del menú por categoría -->
            <div class="menu-items-container" v-else>
              <div v-if="getItemsByCategory(category.value).length === 0" class="no-items">
                No hay productos disponibles en esta categoría.
              </div>
              <transition-group name="menu-item" tag="div" class="menu-items-grid">
                <div v-for="item in getItemsByCategory(category.value)" :key="item.id" class="menu-item-wrapper">
                  <MenuItemCardComponent :menuItem="item" />
                </div>
              </transition-group>
            </div>
          </transition>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  max-width: 1200px;
  min-height: 100vh;
}

.menu-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

.menu-header::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, rgba(172,131,98,0.1) 0%, rgba(172,131,98,1) 50%, rgba(172,131,98,0.1) 100%);
}

.cafeteria-name {
  font-size: 3rem;
  color: #392B1B;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.cafeteria-slogan {
  font-size: 1.25rem;
  color: #8A724A;
  font-style: italic;
  font-weight: 300;
  position: relative;
  display: inline-block;
  padding: 0 15px;
}

.menu-tab-container {
  margin: 0 auto;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(57, 43, 27, 0.08);
  overflow: hidden;
  background-color: #FFF;
  position: relative;
  border: 1px solid rgba(212, 184, 150, 0.2);
}

.menu-tab-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #D4B896, #AC8362, #D4B896);
}

:deep(.p-tabview-nav) {
  display: flex;
  justify-content: center; /* Centra las pestañas horizontalmente */
  border-bottom: none; /* Eliminamos el borde inferior predeterminado */
  background-color: #F8F6F3;
  padding: 0 20px;
  position: relative; /* Para posicionar la línea */
}

/* Línea marrón debajo de la barra de navegación */
:deep(.p-tabview-nav)::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background-color: #8A724A; /* Color marrón para la línea */
}

:deep(.p-tabview-nav li .p-tabview-nav-link) {
  padding: 18px 28px !important;
  color: #8A724A !important;
  font-weight: 500 !important;
  transition: all 0.4s ease !important;
  margin: 0 10px;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  letter-spacing: 0.5px;
}

:deep(.p-tabview-nav li .p-tabview-nav-link:not(.p-disabled):focus) {
  box-shadow: none;
}

:deep(.p-tabview-nav li:not(.p-highlight):not(.p-disabled):hover .p-tabview-nav-link) {
  background-color: transparent !important;
  color: #392B1B !important;
  border-color: #D4B896 !important;
  transform: translateY(-2px);
}

:deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background-color: transparent !important;
  color: #392B1B !important;
  font-weight: 600 !important;
  border-bottom: 3px solid #AC8362 !important;
  position: relative;
}

:deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link::before) {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #8A724A; /* Ajustando el color del punto indicador */
}

:deep(.p-tabview-panels) {
  padding: 40px 20px !important;
  background-color: #FFFFFF;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #8A724A;
}

.loading-indicator i {
  margin-right: 15px;
  font-size: 1.8rem;
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(0.95); }
}

.menu-items-container {
  padding: 0 20px;
  background-color: #FFFFFF;
}

.menu-items-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.menu-item-wrapper {
  display: flex;
  width: 100%;
  transition: all 0.5s ease;
  transform-origin: center;
  position: relative;
}

.menu-item-wrapper::before {
  content: "";
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #D4B896;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-item-wrapper:hover::before {
  opacity: 1;
}

.no-items {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1.1rem;
  font-style: italic;
  background-color: #F8F6F3;
  border-radius: 12px;
  border: 1px dashed #D4B896;
}

/* Elementos decorativos en el fondo */
.menu-container::before,
.menu-container::after {
  content: "";
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  z-index: -1;
  filter: blur(80px);
  opacity: 0.04;
}

.menu-container::before {
  background-color: #D4B896;
  top: 20%;
  right: 20%;
}

.menu-container::after {
  background-color: #AC8362;
  bottom: 10%;
  left: 15%;
}

@media (max-width: 768px) {
  .menu-container {
    padding: 30px 15px 50px;
  }



  .cafeteria-name {
    font-size: 2.2rem;
  }

  .cafeteria-slogan {
    font-size: 1rem;
  }

  :deep(.p-tabview-nav li .p-tabview-nav-link) {
    padding: 14px 18px !important;
    font-size: 0.95rem;
    margin: 0 5px;
  }

  .menu-items-grid {
    gap: 18px;
  }

  :deep(.p-tabview-panels) {
    padding: 25px 10px !important;
  }

  .menu-item-wrapper::before {
    left: -20px;
    width: 6px;
    height: 6px;
  }
}

@media (max-width: 480px) {
  .menu-header {
    padding: 20px 10px;
  }

  .cafeteria-name {
    font-size: 1.8rem;
  }

  .menu-header::after {
    width: 80px;
  }

  :deep(.p-tabview-nav li .p-tabview-nav-link) {
    padding: 10px 12px !important;
    font-size: 0.85rem;
    margin: 0 2px;
  }

  .menu-items-grid {
    gap: 15px;
  }

  .menu-items-container {
    padding: 0 10px;
  }

  .loading-indicator {
    min-height: 200px;
  }
}
</style>