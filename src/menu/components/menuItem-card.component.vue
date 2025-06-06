<script setup>
import { ref, computed, onMounted } from 'vue';
import { MenuService } from '../service/menu.service';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps({
  menuItem: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['itemUpdated', 'itemDeleted']);

const menuService = new MenuService();
const toast = useToast();
const confirm = useConfirm();
const showEditDialog = ref(false);
const isSubmitting = ref(false);
const categories = ref([]);
const fileReader = new FileReader();
const imagePreview = ref('');
const isAdmin = ref(false);

// Clone the menu item for editing
const editedItem = ref({...props.menuItem});

// Check if the current user is an admin
const checkAdminRole = () => {
  try {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);

    if (user && user.roles && Array.isArray(user.roles)) {
      isAdmin.value = user.roles.includes('ROLE_ADMIN');
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    isAdmin.value = false;
  }
};

// Format price for display
const formattedPrice = computed(() => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(props.menuItem.price);
});

// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      editedItem.value.imageBase64 = fileReader.result;
      imagePreview.value = fileReader.result;
    };
  }
};

// Fetch categories when edit dialog opens
const openEditDialog = async () => {
  try {
    const response = await menuService.getAllCategories();
    categories.value = (response.data || ['ENTRADAS', 'PLATOS_PRINCIPALES', 'POSTRES', 'BEBIDAS'])
      .map(category => ({
        label: formatCategoryName(category),
        value: category
      }));

    // Reset the edited item to the current menu item
    editedItem.value = {...props.menuItem};
    imagePreview.value = props.menuItem.imageBase64;
    showEditDialog.value = true;
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las categorías', life: 3000 });
  }
};

// Format category name for display
const formatCategoryName = (category) => {
  if (!category) return '';
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const updateItem = async () => {
  if (!editedItem.value.name || !editedItem.value.description || !editedItem.value.price) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Todos los campos son obligatorios', life: 3000 });
    return;
  }

  try {
    isSubmitting.value = true;

    const itemToUpdate = {
      id: editedItem.value.id,
      name: editedItem.value.name,
      description: editedItem.value.description,
      price: editedItem.value.price,
      category: editedItem.value.category,
      imageBase64: editedItem.value.imageBase64
    };

    // Use the item's actual ID for update
    const response = await menuService.updateMenuItem(itemToUpdate.id, itemToUpdate);

    // Update the original menu item object to reflect changes immediately
    Object.assign(props.menuItem, itemToUpdate);

    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Plato actualizado correctamente', life: 3000 });
    emit('itemUpdated', editedItem.value.category);
    showEditDialog.value = false;
  } catch (error) {
    console.error('Error updating menu item:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: `No se pudo actualizar el plato: ${error.message}`, life: 3000 });
  } finally {
    isSubmitting.value = false;
  }
};
const confirmDelete = () => {
  confirm.require({
    message: '¿Estás seguro de que quieres eliminar este plato?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteItem(),
    reject: () => {
      toast.add({ severity: 'info', summary: 'Cancelado', detail: 'Eliminación cancelada', life: 3000 });
    }
  });
};

// In menuItem-card.component.vue
const deleteItem = async () => {
  try {
    const itemId = props.menuItem.id;
    await menuService.deleteMenuItem(itemId);

    // Close the confirm dialog
    confirm.close();

    // Emit with both category and id
    emit('itemDeleted', {
      category: props.menuItem.category,
      id: props.menuItem.id
    });

    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Plato eliminado correctamente', life: 3000 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: `No se pudo eliminar el plato: ${error.message}`, life: 3000 });
  }
};

onMounted(() => {
  checkAdminRole();
});
</script>

<template>
  <div class="menu-item-card">
    <div class="menu-item-image">
      <img :src="menuItem.imageBase64" :alt="menuItem.name" />
    </div>
    <div class="menu-item-content">
      <div class="menu-item-header">
        <h3 class="menu-item-name">{{ menuItem.name }}</h3>
        <div class="menu-item-price">{{ formattedPrice }}</div>
      </div>
      <p class="menu-item-description">{{ menuItem.description }}</p>

      <!-- Admin Controls -->
      <div v-if="isAdmin" class="admin-controls">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-outlined p-button-sm edit-button"
          @click="openEditDialog"
          aria-label="Editar plato"
        />
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-outlined p-button-danger p-button-sm delete-button"
          @click="confirmDelete"
          aria-label="Eliminar plato"
        />
      </div>
    </div>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Editar plato"
      :style="{width: '450px'}"
      :modal="true"
      class="menu-item-dialog"
    >
      <div class="form-container">
        <div class="form-field">
          <label for="name">Nombre</label>
          <InputText id="name" v-model="editedItem.name" class="w-full" />
        </div>

        <div class="form-field">
          <label for="description">Descripción</label>
          <Textarea id="description" v-model="editedItem.description" rows="3" class="w-full" />
        </div>

        <div class="form-field">
          <label for="price">Precio</label>
          <InputNumber id="price" v-model="editedItem.price" mode="currency" currency="PEN" locale="es-PE" class="w-full" />
        </div>

        <div class="form-field">
          <label for="category">Categoría</label>
          <Dropdown
            id="category"
            v-model="editedItem.category"
            :options="categories"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar categoría"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="image">Imagen</label>
          <div class="image-upload-container">
            <Button
              type="button"
              icon="pi pi-image"
              label="Cambiar imagen"
              class="p-button-outlined"
              @click="$refs.fileInput.click()"
            />
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              style="display: none"
            />
          </div>
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Vista previa" />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          @click="showEditDialog = false"
          class="p-button-text"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          @click="updateItem"
          :loading="isSubmitting"
        />
      </template>
    </Dialog>

    <!-- Confirm Dialog component is used via useConfirm() -->
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.menu-item-card {
  display: flex;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(172, 131, 98, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.menu-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(172, 131, 98, 0.15);
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
  transition: transform 0.5s;
}

.menu-item-card:hover .menu-item-image img {
  transform: scale(1.1);
}

.menu-item-content {
  flex: 1;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.menu-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.menu-item-name {
  margin: 0;
  font-size: 1.3rem;
  color: var(--text-primary);
  font-weight: 600;
}

.menu-item-price {
  background-color: var(--primaryColor100);
  color: var(--primaryColor800);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
}

.menu-item-description {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
  flex-grow: 1;
}

.admin-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-item-card:hover .admin-controls {
  opacity: 1;
}

.edit-button {
  color: var(--primaryColor600);
  border-color: var(--primaryColor400);
}

.edit-button:hover {
  background-color: var(--primaryColor50);
  border-color: var(--primaryColor600);
}

.delete-button:hover {
  background-color: #FFEEEE;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-weight: 600;
  color: var(--text-primary);
}

.image-upload-container {
  margin-top: 6px;
}

.image-preview {
  margin-top: 12px;
  padding: 10px;
  border: 1px dashed var(--primaryColor300);
  border-radius: 8px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .menu-item-image {
    width: 100px;
    height: 100px;
  }

  .menu-item-content {
    padding: 12px 15px;
  }

  .menu-item-name {
    font-size: 1.1rem;
  }

  .menu-item-price {
    font-size: 0.95rem;
    padding: 3px 8px;
  }

  .menu-item-description {
    font-size: 0.9rem;
  }

  .admin-controls {
    opacity: 1;
  }
}
</style>