<template>
  <ion-page>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
            </ion-buttons>
            <ion-title>Selecione um tema para estudar</ion-title>
        </ion-toolbar>
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
    </ion-header>
    <ion-content>
      <article>
        <header>
          <ion-breadcrumbs>
            <ion-breadcrumb v-for="path in foldersPath" @click="actions.openFolder(path.folder)">{{ path.name }}</ion-breadcrumb>
          </ion-breadcrumbs>
        </header>
        <main>
          <ion-list>
            <ion-item v-if="foldersPath.length > 1" @click="actions.goBackFolder()" :button="true" :detail="false">
                <ion-icon slot="start" :icon="arrowBackOutline"></ion-icon>
                <ion-label>Voltar</ion-label>
            </ion-item>



            <ion-item v-if="folderContents" v-for="folder in folderContents.folders" @click="actions.openFolder(folder)" :button="true" :detail="true">
                <ion-icon slot="start" :icon="folderOutline"></ion-icon>
                <ion-label>{{ folder.name }}</ion-label>
            </ion-item>

            <ion-item v-if="folderContents" v-for="file in folderContents.files" @click="actions.openFile(file)" button>
              <ion-icon slot="start" :icon="documentOutline"></ion-icon>
              <ion-label>{{ file.name }}</ion-label>
            </ion-item>
          </ion-list>
        </main>
      </article>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { apiEndpoint } from '@/utils/Api';
import { DialogEventEmitter } from '@/utils/Dialog';
import { IonPage, IonHeader, IonToolbar,IonButtons, IonProgressBar, IonContent,IonBreadcrumbs, IonBreadcrumb, IonTitle, IonThumbnail, IonImg, IonList, IonItem, IonButton, IonIcon, IonLabel, alertController } from '@ionic/vue';
import { medicalOutline, folderOutline, arrowBackOutline, documentOutline, checkmarkDoneOutline, arrowForwardOutline, radioOutline, codeWorkingOutline, shareOutline, peopleCircleOutline, cloudUploadOutline, closeOutline, playOutline, timeOutline, sendOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();

const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
});

interface OneDriveFile{
  id: string
  name: string
  size: number
  type: string
  downloadUrl: string
  original: {
    "@microsoft.graph.downloadUrl": string
    createdDateTime: string
    cTag: string
    eTag: string
    id: string
    lastModifiedDateTime: string
    name: string
    size: number
    webUrl: string
    reactions: {
      commentCount: number
    }
    createdBy: {
      application: {
        displayName: string
        id: string
      }
      user: {
        displayName: string
        id: string
      }
    }
    lastModifiedBy: {
      application: {
        displayName: string
        id: string
      }
      user: {
        displayName: string
        id: string
      }
    }
    parentReference: {
      driveId: string
      driveType: string
      id: string
      name: string
      path: string
    }
    file: {
      mimeType: string
      hashes: {
        quickXorHash: string
        sha1Hash: string
        sha256Hash: string
      }
    }
    fileSystemInfo: {
      createdDateTime: string
      lastModifiedDateTime: string
    }
  }
}

interface OneDriveFolder{
  id: string
  name: string
  original: {
    createdDateTime: string
    cTag: string
    eTag: string
    id: string
    lastModifiedDateTime: string
    name: string
    size: number
    webUrl: string
    reactions: {
      commentCount: number
    }
    createdBy: {
      application: {
        displayName: string
        id: string
      }
      user: {
        displayName: string
        id: string
      }
    }
    lastModifiedBy: {
      application: {
        displayName: string
        id: string
      }
      user: {
        displayName: string
        id: string
      }
    }
    parentReference: {
      driveId: string
      driveType: string
      id: string
      name: string
      path: string
    }
    fileSystemInfo: {
      createdDateTime: string
      lastModifiedDateTime: string
    }
    folder: {
      childCount: number
      view: {
        viewType: string
        sortBy: string
        sortOrder: string
      }
    }
  }
}


const folderContents = ref<null|{
  folders: OneDriveFolder[]
  files: OneDriveFile[]
}>(null);

const foldersPath = ref<{
  id: string
  name: string,
  folder: OneDriveFolder
}[]>([]);


const isLoading = ref<boolean>(false);
const actions = {
  openFolder: async (folder: OneDriveFolder) => {
    isLoading.value = true;

    const response = await fetch(`${apiEndpoint}/content-explorer/folders/${folder.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json();

    folderContents.value = data;

    //Check if the folder is already in the path, if so, remove all folders after it:
    const folderIndex = foldersPath.value.findIndex((path) => path.id === folder.id);
    if (folderIndex !== -1) {
      foldersPath.value = foldersPath.value.slice(0, folderIndex + 1);
    } else {
      foldersPath.value.push({
        id: folder.id,
        name: folder.name,
        folder
      });
    }

    isLoading.value = false;
  },
  goBackFolder: async () => {
    isLoading.value = true;

    if (foldersPath.value.length === 1) {
      return;
    }


    const response = await fetch(`${apiEndpoint}/content-explorer/folders/${foldersPath.value[foldersPath.value.length - 2].id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    foldersPath.value.pop();

    
    const data = await response.json();

    folderContents.value = data;

    isLoading.value = false;
  },
  openMainFolder: async () => {
    actions.openFolder({
      id: '342C26028B941029!294458',
      name: 'Drive',
    } as any);
  },
  openFile: async (file: OneDriveFile) => {
    props.emitter.fire('selected', file);
    props.emitter.fire('close');
  }
}



onMounted(() => {
  actions.openMainFolder();
})

</script>


<style scoped lang="scss">

</style>
