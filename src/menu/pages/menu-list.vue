<script setup>
import { ref, onMounted, computed } from 'vue';
import { MenuService } from '../service/menu.service';
import MenuItemCardComponent from '../components/menuItem-card.component.vue';
import CreateMenuItem from '../components/create-menu-item.vue';  // Make sure path is correct
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { useToast } from 'primevue/usetoast';

const menuService = new MenuService();
const toast = useToast();
const loading = ref(true);
const menuItems = ref([]);
const activeTabIndex = ref(0);
const cafeteriaName = ref('Cafetería El Aroma');
const slogan = ref('Sabores que inspiran momentos');
const hoverCategory = ref(null);
const isAdmin = ref(false);

const handleItemDeleted = (data) => {
  const { category, id } = data;

  // Remove the deleted item from the main menuItems array
  menuItems.value = menuItems.value.filter(item => item.id !== id);

  // Refresh data from server to ensure state is synchronized
  refreshMenuItems();

  // Show success message to user
  toast.add({
    severity: 'success',
    summary: 'Eliminado',
    detail: 'El plato ha sido eliminado correctamente',
    life: 3000
  });
};

// Add this function to refresh all menu items from the server
const refreshMenuItems = async () => {
  try {
    const response = await menuService.getAllMenuItems();
    menuItems.value = response.data;

    // Fetch the active category items to ensure category tabs are up-to-date
    if (activeTabIndex.value >= 0) {
      const activeCat = getCategoryByIndex(activeTabIndex.value);
      fetchMenuItemsByCategory(activeCat);
    }
  } catch (error) {
    console.error('Error refreshing menu items:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron actualizar los platos',
      life: 3000
    });
  }
};
const categories = [
  { label: 'Entradas', value: 'ENTRADAS', icon: '🍽️' },
  { label: 'Platos Principales', value: 'PLATOS_PRINCIPALES', icon: '🍲' },
  { label: 'Postres', value: 'POSTRES', icon: '🍰' },
  { label: 'Bebidas', value: 'BEBIDAS', icon: '🥤' }
];

const checkAdminRole = () => {
  try {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);

    // Make sure roles exists and is an array containing ROLE_ADMIN
    if (user && user.roles && Array.isArray(user.roles)) {
      const hasAdminRole = user.roles.includes('ROLE_ADMIN');
      console.log('User roles:', user.roles);
      console.log('Has ROLE_ADMIN:', hasAdminRole);
      isAdmin.value = hasAdminRole;
    } else {
      console.log('Invalid roles property:', user.roles);
      isAdmin.value = false;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    isAdmin.value = false;
  }
};

const getCategoryByIndex = (index) => {
  return categories[index].value;
};

const getItemsByCategory = (categoryValue) => {
  return menuItems.value.filter(item => item.category === categoryValue);
};

const activeCategoryIcon = computed(() => {
  return categories[activeTabIndex.value].icon;
});

const activeCategory = computed(() => {
  return getCategoryByIndex(activeTabIndex.value);
});

const fetchMenuItems = async () => {
  try {
    loading.value = true;
    const response = await menuService.getAllMenuItems();
    menuItems.value = response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los platos', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const fetchMenuItemsByCategory = async (category) => {
  try {
    loading.value = true;
    const response = await menuService.getMenuItemsByCategory(category);
    const otherCategories = menuItems.value.filter(item => item.category !== category);
    menuItems.value = [...otherCategories, ...response.data];
  } catch (error) {
    console.error(`Error fetching menu items for category ${category}:`, error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudieron cargar los platos de la categoría ${category}`,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const handleItemCreated = async (category) => {
  await fetchMenuItemsByCategory(category);
};

const handleTabChange = (e) => {
  activeTabIndex.value = e.index;
  const categoryValue = getCategoryByIndex(e.index);
  fetchMenuItemsByCategory(categoryValue);
};

const setHoverCategory = (index) => {
  hoverCategory.value = index;
};

const clearHoverCategory = () => {
  hoverCategory.value = null;
};

onMounted(async () => {
  checkAdminRole();
  await fetchMenuItems();
  fetchMenuItemsByCategory(getCategoryByIndex(activeTabIndex.value));
});
</script>

<template>
  <div class="menu-container">
    <div class="menu-header">
      <div class="header-accent-left"></div>
      <div class="header-content">
        <h1 class="cafeteria-name">{{ cafeteriaName }}</h1>
        <p class="cafeteria-slogan">{{ slogan }}</p>
      </div>
      <div class="header-accent-right"></div>
    </div>

    <div class="category-icon-container">
      <div class="active-category-icon">{{ activeCategoryIcon }}</div>
    </div>

    <div class="menu-tab-container">
      <TabView :activeIndex="activeTabIndex" @tab-change="handleTabChange">
        <TabPanel
            v-for="(category, index) in categories"
            :key="index"
            :header="category.label"
            @mouseenter="setHoverCategory(index)"
            @mouseleave="clearHoverCategory"
        >
          <div v-if="isAdmin" class="add-menu-item-container">
            <CreateMenuItem
                :category="category.value"
                :onItemCreated="handleItemCreated"
            />
          </div>

          <transition name="fade-slide" mode="out-in">
            <div class="loading-container" v-if="loading">
              <div class="loading-indicator">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Cargando delicias...</span>
              </div>
            </div>
            <div class="menu-items-container" v-else>
              <div v-if="getItemsByCategory(category.value).length === 0" class="no-items">
                <span class="no-items-icon">🍽️</span>
                <p>No hay productos disponibles en esta categoría.</p>
                <span class="no-items-subtext">¡Vuelve pronto para descubrir nuevas delicias!</span>
              </div>
              <transition-group name="menu-item" tag="div" class="menu-items-grid">
                <div v-for="item in getItemsByCategory(category.value)" :key="item.id" class="menu-item-wrapper">
                  <MenuItemCardComponent
                    :menuItem="item"
                    @itemDeleted="handleItemDeleted"
                    @itemUpdated="handleItemUpdated"
                  />
                </div>
              </transition-group>
            </div>
          </transition>
        </TabPanel>
      </TabView>
    </div>

    <div class="menu-footer">
      <div class="decorative-utensil left">🍴</div>
      <p>Nuestro menú se actualiza con ingredientes frescos de temporada</p>
      <div class="decorative-utensil right">🍴</div>
    </div>
  </div>
</template>


<style scoped>
.menu-header {
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-accent-left,
.header-accent-right {
  height: 2px;
  flex: 1;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--primaryColor200) 40%,
    var(--primaryColor500) 50%,
    var(--primaryColor200) 60%,
    transparent 100%);
  max-width: 150px;
  margin: 0 30px;
  position: relative;
}

.header-accent-left::before,
.header-accent-right::before {
  content: "✦";
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primaryColor500);
  font-size: 20px;
}
.admin-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding: 0 15px;
  background-color: var(--primaryColor50);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(172, 131, 98, 0.08);
}

@media (max-width: 768px) {
  .admin-button-container {
    padding: 10px;
    margin-bottom: 15px;
  }
}
.header-accent-left::before {
  right: -5px;
}
.admin-item-creator {
  margin-bottom: 25px;
  background-color: var(--primaryColor50);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(172, 131, 98, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.admin-item-creator:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(172, 131, 98, 0.15);
}

@media (max-width: 768px) {
  .admin-item-creator {
    padding: 12px;
    margin-bottom: 20px;
  }
}
.header-accent-right::before {
  left: -5px;
}

.cafeteria-name {
  font-size: 3.5rem;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 2px 2px 4px rgba(86, 63, 37, 0.1);
  background: linear-gradient(45deg, var(--primaryColor700), var(--primaryColor500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s infinite alternate;
}

@keyframes shimmer {
  0% {
    background-position: left;
  }
  100% {
    background-position: right;
  }
}

.cafeteria-slogan {
  color: var(--primaryColor600);
  position: relative;
  display: inline-block;
  padding: 0 20px;
}

.cafeteria-slogan::before,
.cafeteria-slogan::after {
  content: "~";
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primaryColor400);
  font-size: 1.5rem;
}

.cafeteria-slogan::before {
  left: 0;
}

.cafeteria-slogan::after {
  right: 0;
}

.category-icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.active-category-icon {
  font-size: 2.5rem;
  padding: 15px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(172, 131, 98, 0.15);
  transform: translateY(30px);
  z-index: 10;
  position: relative;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(30px); }
  50% { transform: translateY(25px); }
}

.menu-tab-container {
  margin: 0 auto;
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(86, 63, 37, 0.1);
  overflow: hidden;
  background-color: #FFF;
  position: relative;
  border: 1px solid var(--primaryColor100);
  transition: transform 0.3s, box-shadow 0.3s;
}

.menu-tab-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(86, 63, 37, 0.15);
}

.menu-tab-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--primaryColor300), var(--primaryColor500), var(--primaryColor300));
}

:deep(.p-tabview-nav) {
  display: flex;
  justify-content: center;
  border-bottom: none;
  background-color: var(--primaryColor50);
  padding: 0 20px;
  position: relative;
}
:deep(.p-tabview-tablist) {
  background: var(--primaryColor100) !important; /* Light brown color from your palette */
  border-bottom-color: var(--primaryColor200) !important;
  border-radius: 16px 16px 0 0;
  padding: 8px 8px 0 8px;
}
:deep(.p-tabview-nav)::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--primaryColor300) 20%,
    var(--primaryColor500) 50%,
    var(--primaryColor300) 80%,
    transparent 100%);
}

:deep(.p-tabview-nav li .p-tabview-nav-link) {
  padding: 18px 28px !important;
  color: var(--primaryColor600) !important;
  font-weight: 600 !important;
  transition: all 0.4s ease !important;
  margin: 0 10px;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  border-radius: 10px 10px 0 0 !important;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

:deep(.p-tabview-nav li .p-tabview-nav-link::before) {
  content: "";
  position: absolute;
  width: 100%;
  height: 0;
  bottom: 0;
  left: 0;
  background-color: var(--primaryColor100);
  transition: height 0.3s ease;
  z-index: -1;
}

:deep(.p-tabview-nav li:hover .p-tabview-nav-link::before) {
  height: 100%;
}

:deep(.p-tabview-nav li .p-tabview-nav-link:not(.p-disabled):focus) {
  box-shadow: none;
}

:deep(.p-tabview-nav li:not(.p-highlight):not(.p-disabled):hover .p-tabview-nav-link) {
  background-color: transparent !important;
  color: var(--primaryColor800) !important;
  transform: translateY(-3px);
}

:deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background-color: white !important;
  color: var(--primaryColor800) !important;
  font-weight: 700 !important;
  border-bottom: 3px solid var(--primaryColor500) !important;
  position: relative;
  box-shadow: 0 -5px 15px rgba(172, 131, 98, 0.1);
}

:deep(.p-tabview-panels) {
  padding: 40px 20px !important;
  background-color: #FFFFFF;
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background-color: var(--primaryColor50);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(86, 63, 37, 0.05);
}

.loading-indicator i {
  margin-bottom: 15px;
  font-size: 2.5rem;
  color: var(--primaryColor500);
  animation: spin-pulse 1.5s infinite;
}

.loading-indicator span {
  font-size: 1.1rem;
  color: var(--primaryColor600);
  font-style: italic;
}

@keyframes spin-pulse {
  0%, 100% { opacity: 0.7; transform: scale(0.95) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.05) rotate(180deg); }
}

.menu-items-container {
  padding: 0 20px;
  background-color: #FFFFFF;
}

.menu-items-grid {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.menu-item-wrapper {
  display: flex;
  width: 100%;
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
  transform-origin: center;
  position: relative;
}

.menu-item-wrapper:hover {
  transform: translateX(10px) scale(1.02);
}

.menu-item-wrapper::before {
  content: "";
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: var(--primaryColor400);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
}

.menu-item-wrapper:hover::before {
  opacity: 1;
  left: -30px;
  box-shadow: 0 0 10px var(--primaryColor400), 0 0 20px var(--primaryColor200);
}

.no-items {
  text-align: center;
  padding: 60px 20px;
  color: var(--primaryColor600);
  font-size: 1.1rem;
  background-color: var(--primaryColor50);
  border-radius: 15px;
  border: 2px dashed var(--primaryColor200);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% { border-color: var(--primaryColor200); }
  50% { border-color: var(--primaryColor400); }
}

.no-items-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: swing 2s infinite;
}

@keyframes swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.no-items-subtext {
  font-size: 0.9rem;
  color: var(--primaryColor400);
  font-style: italic;
  margin-top: 10px;
}

.menu-footer {
  margin-top: 60px;
  text-align: center;
  color: var(--primaryColor600);
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.decorative-utensil {
  font-size: 1.5rem;
  animation: rotate 5s linear infinite;
}

.decorative-utensil.left {
  transform: scaleX(-1);
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Menu item animation */
.menu-item-enter-active,
.menu-item-leave-active {
  transition: all 0.4s ease;
}

.menu-item-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.menu-item-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Fade-slide animation */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
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

  .active-category-icon {
    font-size: 2rem;
    padding: 12px;
  }

  .header-accent-left,
  .header-accent-right {
    max-width: 80px;
    margin: 0 15px;
  }

  :deep(.p-tabview-nav li .p-tabview-nav-link) {
    padding: 14px 20px !important;
    font-size: 0.95rem;
    margin: 0 5px;
  }

  .menu-items-grid {
    gap: 22px;
  }

  :deep(.p-tabview-panels) {
    padding: 25px 10px !important;
  }

  .menu-item-wrapper::before {
    left: -15px;
    width: 6px;
    height: 6px;
  }
}

@media (max-width: 480px) {
  .menu-header {
    padding: 20px 10px;
    flex-direction: column;
  }

  .header-accent-left,
  .header-accent-right {
    width: 70%;
    max-width: none;
    margin: 15px 0;
  }

  .header-accent-left {
    order: 2;
  }

  .header-content {
    order: 1;
  }

  .header-accent-right {
    order: 3;
  }

  .cafeteria-name {
    font-size: 1.8rem;
  }

  .cafeteria-slogan {
    font-size: 0.9rem;
  }

  .active-category-icon {
    font-size: 1.8rem;
    padding: 10px;
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
    padding: 20px;
  }

  .loading-indicator i {
    font-size: 2rem;
  }

  .menu-footer {
    flex-direction: column;
    gap: 10px;
  }
}
</style>