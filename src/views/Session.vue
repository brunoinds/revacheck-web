<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Estação #{{ dynamicData.connectionId }}</ion-title>
        <ion-buttons slot="end">
          <ion-button color="warning" v-if="dynamicData.cronometer.stopAt">
            <ion-icon slot="start" :icon="timeOutline"></ion-icon>
            {{ cronometerUI }}
          </ion-button>
          <ion-button @click="actions.finishStation" color="danger" v-if="dynamicData.stage == 'ongoing-station' && dynamicData.role == 'doctor'">
            <ion-icon slot="end" :icon="closeOutline"></ion-icon>
            Terminar estação
          </ion-button>

          <ion-button @click="actions.goToNewStation" color="success" v-if="dynamicData.stage == 'finished-station'">
            <ion-icon slot="end" :icon="reloadOutline"></ion-icon>
            Nova estação
          </ion-button>

          <ion-button @click="actions.startStation" color="success" v-if="dynamicData.stage == 'waiting-start' && dynamicData.role == 'actor'">
            <ion-icon slot="end" :icon="playOutline"></ion-icon>
            Iniciar estação
          </ion-button>
        </ion-buttons>
        <ion-progress-bar v-if="isLoadingUI" type="indeterminate"></ion-progress-bar>
      </ion-toolbar>
    </ion-header>
    <ion-content :scroll-y="false">
      <section class="view-page">
        <header>
          <ion-segment v-model="dynamicData.tab">
            <ion-segment-button value="indications" v-if="(dynamicData.stage == 'ongoing-station' || dynamicData.stage == 'finished-station') || (dynamicData.stage == 'waiting-start' && dynamicData.role == 'actor')">
              <ion-label>📒 Indicações</ion-label>
            </ion-segment-button>
            <ion-segment-button value="pressings" v-if="(dynamicData.stage == 'ongoing-station' || dynamicData.stage == 'finished-station') || (dynamicData.stage == 'waiting-start' && dynamicData.role == 'actor')">
              <ion-label>📑 Impressos</ion-label>
            </ion-segment-button>
            <ion-segment-button value="checklist" v-if="(dynamicData.stage == 'ongoing-station' || dynamicData.stage == 'finished-station') || (dynamicData.stage == 'waiting-start' && dynamicData.role == 'actor')">
              <ion-label>✅ Checklist</ion-label>
            </ion-segment-button>
          </ion-segment>
        </header>
        <main>
          <section v-show="dynamicData.tab == 'prepare'" v-if="!dynamicData.pdf.blobUri" style="height: 100%; display: flex; align-items: center; justify-content: center;">
            <article style="display: flex; flex-direction: column; align-items: center; text-align: center;" v-if="dynamicData.role == 'actor' && !loadingPdfFileOnline">
              <header>
                <ion-label style="font-size: 55px;">
                  <ion-icon color="danger" :icon="medicalOutline"></ion-icon>
                </ion-label>
                <h1>Nova estação</h1>
                <p>Para começar, selecione um caso clínico que contém as instruções da estação</p>
              </header>
              

              <main>
                <ion-button expand="block" @click="actions.choosePdf">Selecionar Caso Clínico</ion-button>
              </main>
            </article>

            <article style="display: flex; flex-direction: column; align-items: center; text-align: center;" v-if="dynamicData.role == 'actor' && loadingPdfFileOnline">
              <header>
                <ion-label style="font-size: 55px;">
                  <ion-icon color="warning" :icon="cloudDownloadOutline"></ion-icon>
                </ion-label>
                <h1>Baixando materiais da estação ({{ loadingPdfFileOnline.percentage.toFixed(2) }}%)...</h1>
                <p>Aguarde enquanto fazemos o download dos materiais necessários para poder começar a estação</p>
              </header>
            </article>


            <article style="display: flex; flex-direction: column; align-items: center; text-align: center;" v-if="dynamicData.role == 'doctor' && dynamicData.pdf.fileName != null">
              <!--<header>
                <ion-label style="font-size: 55px;">
                  <ion-icon color="success" :icon="cloudUploadOutline"></ion-icon>
                </ion-label>
                <h1>Subir arquivo PDF</h1>
                <p>Para começar, você deve subir o mesmo PDF que o ator está solicitando, que é o arquivo:</p>
                <pre style="background-color: #424242; width: fit-content; margin: 0 auto; padding: 10px 30px; font-size: 17px; border-radius: 12px;">{{ dynamicData.pdf.fileName }}</pre>

              </header>
              
              <br>
              <main>
                <ion-button expand="block" @click="actions.choosePdf">Selecionar arquivo PDF</ion-button>
              </main>-->

              <header>
                <ion-label style="font-size: 55px;">
                  <ion-icon color="warning" :icon="cloudDownloadOutline"></ion-icon>
                </ion-label>
                <h1>Baixando materiais da estação ({{ (loadingPdfFileOnline) ? loadingPdfFileOnline.percentage.toFixed(2) : '0' }}%)...</h1>
                <p>Aguarde enquanto fazemos o download dos materiais necessários para poder começar a estação</p>
              </header>
            </article>


            <article style="display: flex; flex-direction: column; align-items: center; text-align: center;" v-if="dynamicData.role == 'doctor' && dynamicData.pdf.fileName == null">
              <header>
                <ion-label style="font-size: 55px;">
                  <ion-icon color="primary" :icon="codeWorkingOutline"></ion-icon>
                </ion-label>
                <h1>Conectando-se ao avaliador...</h1>
                <p>Um momento enquanto estabelecemos uma conexão ativa na estação #{{ dynamicData.connectionId }}</p>
              </header>
            </article>
          </section>

          <section class="section-with-sidebar" v-show="dynamicData.tab == 'prepare'" v-if="dynamicData.pdf.blobUri">
            <main>
                <embed v-if="dynamicData.pdf.blobUri" style="width: 100%; height: 100%;" :src="dynamicData.pdf.blobUri"></embed>
            </main>

              <aside>
                <div class="ion-padding">
                  <ion-label>
                    <p>Passo 1.</p>
                    <h2><b>Preparar a estação</b></h2>
                    <p>Selecione as páginas que correspondem às Indicações ao Candidato, Indicações ao Ator, Impressos e Checklist:</p>
                  </ion-label>
                </div>
                <ion-list>
                  <ion-item>
                    <ion-input v-model="dynamicData.texts.doctorIndications" label="Páginas Indicação Candidato" label-placement="floating" placeholder="1,2,3"></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-input v-model="dynamicData.texts.actorIndications" label="Páginas Indicação Ator" label-placement="floating" placeholder="1,2,3"></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-input v-model="dynamicData.texts.pressings" label="Páginas de Impressos" label-placement="floating" placeholder="1,2,3"></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-input v-model="dynamicData.texts.checklist" label="Páginas do Checklist" label-placement="floating" placeholder="1,2,3"></ion-input>
                  </ion-item>
                </ion-list>


                <div class="ion-padding">
                  <ion-button expand="block" @click="actions.inviteDoctor" :disabled="isLoadingPdfAndImages">
                    <ion-icon slot="end" :icon="arrowForwardOutline"></ion-icon>
                    Seguinte
                  </ion-button>
                </div>
                
              </aside>
          </section>


          <section  v-show="dynamicData.tab == 'waiting-doctor'" style="height: 100%; display: flex; align-items: center; justify-content: center;">
            <article style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <header>
                <ion-label style="font-size: 95px;">
                  <ion-icon color="primary" :icon="radioOutline"></ion-icon>
                </ion-label>
                <h1>Esperando o médico se conectar...</h1>
                <p>Envie ao médico o seguinte código ou copie e cole o link:</p>

                <pre style="background-color: #424242; width: fit-content; margin: 0 auto; padding: 10px 30px; font-size: 37px; border-radius: 12px;">{{ dynamicData.connectionId }}</pre>
              </header>
              
              <br>
              <main>
                <ion-button expand="block" @click="actions.copyShareLink">
                  <ion-icon slot="end" :icon="shareOutline"></ion-icon>
                  Copiar link
                </ion-button>
              </main>
            </article>
          </section>

          <section  v-show="dynamicData.tab == 'waiting-doctor-ready'">
            <main>
              <h1>Esperando o médico selecionar o PDF...</h1>
              <p>Envie a ele esse código para que ele possa se conectar:</p>
              <pre>{{ dynamicData.connectionId }}</pre>
            </main>
            <ion-button expand="block" @click="actions.startStation">Iniciar estação</ion-button>

          </section>


          <section  v-show="dynamicData.tab == 'waiting-start' && dynamicData.role == 'doctor'" style="height: 100%; display: flex; align-items: center; justify-content: center;">
            <article style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <header>
                <ion-label style="font-size: 95px;">
                  <ion-icon color="primary" :icon="peopleCircleOutline"></ion-icon>
                </ion-label>
                <h1>Esperando o ator iniciar a estação...</h1>
                <p>O ator está se preparando para poder iniciar com a simulação. A estação pode começar a qualquer momento!</p>
              </header>
            </article>
          </section>

          

          <section class="section-with-sidebar-gallery" v-show="dynamicData.tab == 'indications'" style="position: absolute; top: 48px; bottom: 0px; left: 0px; right: 0px; display: flex; align-items: flex-start; overflow: scroll;">
            <main style="display: flex; flex-direction: column; row-gap: 10px;">
              <img v-for="index in dynamicData.pageIndexes.doctorIndications" :src="dynamicData.pdf.pagesAsImages[index]"></img>
              <img v-if="dynamicData.role == 'actor'" v-for="index in dynamicData.pageIndexes.actorIndications" :src="dynamicData.pdf.pagesAsImages[index]"></img>
            </main>
          </section>

          <section class="section-with-sidebar-gallery" v-show="dynamicData.tab == 'pressings'" style="position: absolute; top: 48px; left: 0; right: 0; bottom: 0;">
            <aside style="position: absolute; top: 0px; left: 0px; bottom: 0px; width: 184px; overflow: scroll;">
              <ion-list v-if="dynamicData.role == 'actor' || (dynamicData.role == 'doctor' && dynamicData.pageIndexes.allowedPressings.length > 0)">
                <ion-item button v-if="dynamicData.role == 'actor'" v-for="index in dynamicData.pageIndexes.pressings" @click="() => viewsDynamicData.indications.currentPage = index">
                  <ion-img width="100" :src="dynamicData.pdf.pagesAsImages[index]"></ion-img>
                  <ion-button :color="!dynamicData.pageIndexes.allowedPressings.includes(index) ? 'secondary' : 'success'" slot="end"  @click="(ev) => actions.allowPressing(ev, index)">
                    <ion-icon v-if="!dynamicData.pageIndexes.allowedPressings.includes(index)" :icon="sendOutline"></ion-icon>
                    <ion-icon v-if="dynamicData.pageIndexes.allowedPressings.includes(index)" :icon="checkmarkDoneOutline"></ion-icon>
                  </ion-button>
                </ion-item>


                <ion-item v-if="dynamicData.role == 'doctor'" button v-for="index in dynamicData.pageIndexes.allowedPressings" @click="() => viewsDynamicData.indications.currentPage = index">
                  <ion-img width="100" :src="dynamicData.pdf.pagesAsImages[index]"></ion-img>
                </ion-item>
              </ion-list>
            </aside>

            <main style="position: absolute; inset: 0px 0px 0px 184px; display: flex; width: unset;" v-if="dynamicData.role == 'actor' || (dynamicData.role == 'doctor' && dynamicData.pageIndexes.allowedPressings.length > 0)">
              <img style="max-width: 100%; height: 100%;object-fit: scale-down;" v-if="viewsDynamicData.indications.currentPage != null" :src="dynamicData.pdf.pagesAsImages[viewsDynamicData.indications.currentPage]"></img>
            </main>

            <main style="position: absolute; inset: 0px 0px 0px 184px; display: flex; width: unset;" v-if="(dynamicData.role == 'doctor' && dynamicData.pageIndexes.allowedPressings.length == 0)">
              <h1>O avaliador ainda não liberou nenhum impresso</h1>
            </main>
          </section>


          <section class="section-with-sidebar-gallery" v-show="dynamicData.tab == 'checklist'" v-if="(dynamicData.stage == 'finished-station' && dynamicData.role == 'doctor') || (dynamicData.role == 'actor')" style="position: absolute; top: 48px; bottom: 0px; left: 0px; right: 0px; display: flex; align-items: flex-start; overflow: scroll;">
            <main style="display: flex;flex-direction: column;row-gap: 10px;position: absolute; width: unset; top: 0px;left: 0px;bottom: 0px;right: 200px;overflow: scroll;justify-content: flex-start;">
              <article style="max-width: 500px;" class="checklist-page" v-for="index in dynamicData.pageIndexes.checklist">
                <section @click="(ev) => {clickOnChecklistPage(ev, index)}">
                  <img :src="dynamicData.pdf.pagesAsImages[index]"></img>
                </section>
                <ion-button size="small" class="checklist-button" @click="(ev) => {clickOnButtonOnChecklistPage(ev, index, point)}" v-for="point in dynamicData.checklist.pages[index].points" :style="'top:' + point.y + 'px; left: ' + point.x + 'px;'">
                  <ion-icon :icon="checkmarkOutline"></ion-icon>
                </ion-button>
              </article>
            </main>
            <aside style="position: absolute; top: 0; right: 0; bottom: 0; width: 170px;">
              <article>
                <header style="text-align: center">
                  <h1 style="font-size: 15px">Pontuação</h1>
                  <h2 style="font-size: 32px; margin-bottom: 18px;">{{ dynamicData.checklist.pontuation.toFixed(2) }}</h2>
                </header>
                <main style="display: ruby;" v-if="dynamicData.role == 'actor'">
                  <ion-button color="dark" @click="actions.addPontuation(0.05)">+0.05</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(0.10)">+0.10</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(0.10)">+0.20</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(0.25)">+0.25</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(0.30)">+0.30</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(0.50)">+0.50</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(0.75)">+0.75</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(1)">+1.00</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(1.5)">+1.50</ion-button>
                  <ion-button color="dark" @click="actions.addPontuation(2)">+2.00</ion-button>
                </main>
                <footer style="display: flex;align-items: center;justify-content: center;"  v-if="dynamicData.role == 'actor'">
                  <ion-button color="dark" style="width: 145px;" @click="actions.removePontuation()">Desfazer</ion-button>
                </footer>
              </article>

            </aside>
          </section>
        </main>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonSegment, IonProgressBar, IonButtons, IonIcon, IonSegmentButton, IonLabel, IonButton, IonContent, IonList, IonItem, IonInput, IonImg, toastController, alertController } from '@ionic/vue';
import { FilePicker } from '@capawesome/capacitor-file-picker';

import { VuePdf, createLoadingTask } from 'vue3-pdfjs/esm';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { medicalOutline, checkmarkDoneOutline, reloadOutline,cloudDownloadOutline, checkmarkOutline, arrowForwardOutline, radioOutline, codeWorkingOutline, shareOutline, peopleCircleOutline, cloudUploadOutline, closeOutline, playOutline, timeOutline, sendOutline } from 'ionicons/icons';
import { TStorage } from '@/utils/TStorage';
import { websocketUrl } from '@/utils/Api';
import { Dialog } from '@/utils/Dialog';
import Explorer from '@/views/Explorer.vue';
import axios from 'axios';
import {Sha256} from '@aws-crypto/sha256-js';


const route = useRoute();
const router = useRouter();

const role = route.query.role as 'actor' | 'doctor' || 'actor';
const connectionId = route.params.connectionId as string ;


const lastPontuationSum:Array<number> = [0];


//Stages: prepare-station, waiting-doctor, waiting-start, ongoing-station, finished-station

const dynamicData = ref<{
  stage: 'prepare-station' | 'waiting-doctor' | 'waiting-doctor-ready' | 'waiting-start' | 'ongoing-station' | 'finished-station';
  connectionId: string;
  tab: 'prepare' | 'waiting-doctor'| 'waiting-doctor-ready' | 'waiting-start' | 'indications' | 'pressings' | 'checklist' | 'new-station';
  pageIndexes: {
    actorIndications: number[];
    doctorIndications: number[];
    allowedPressings: number[];
    pressings: number[];
    checklist: number[];
  };
  pdf: {
    base64: string | null;
    blobUri: string | null;
    pagesAsImages: string[];
    fileName: string | null;
    fileUrl: string | null;
  };
  role: 'actor' | 'doctor';
  texts: {
    actorIndications: string;
    doctorIndications: string;
    pressings: string;
    checklist: string;
  };
  checklist: {
    pontuation: number,
    pages: {}
  };
  cronometer: {
    stopAt: string|null
  };
}>({
  stage: 'prepare-station',
  connectionId: connectionId,
  tab: 'prepare',
  pageIndexes: {
    actorIndications: [],
    doctorIndications: [],
    allowedPressings: [],
    pressings: [],
    checklist: [],
  },
  pdf: {
    base64: null,
    blobUri: null,
    pagesAsImages: [],
    fileName: null,
    fileUrl: null
  },
  role: role,
  texts: {
    actorIndications: '2,3,4',
    doctorIndications: '1',
    pressings: '8,9,10',
    checklist: '5,6',
  },
  checklist: {
    pontuation: 0,
    pages: {}
  },
  cronometer: {
    stopAt: null
  }
})

const viewsDynamicData = ref({
  indications: {
    currentPage: null
  }
})

let stationCronometer = ref<{
  interval: any | null,
  time: number
}>({
  interval: null,
  time: 0
});

const cronometerUI = computed(() => {
  const minutes = Math.floor(stationCronometer.value.time / 60);
  const seconds = stationCronometer.value.time % 60;
  const secondsString = seconds < 10 ? '0' + seconds : seconds;
  return `${minutes}:${secondsString}`;
})



const isLoadingPdfAndImages = ref<boolean>(false);
const loadingPdfFileOnline = ref<{
  percentage: number,
  text: string
}|null>(null);
const isLoadingUI = computed(() => {
  if (isLoadingPdfAndImages.value) {
    return true;
  }else{
    if (dynamicData.value.role == 'actor') {
      if (dynamicData.value.stage == 'waiting-doctor') {
        return true;
      }
    }else if (dynamicData.value.role == 'doctor') {
      if (dynamicData.value.stage == 'waiting-start') {
        return true;
      }else if (dynamicData.value.stage == 'prepare-station') {
        return true;
      }
    }
  }
  return false;
})

const actions = {
  goToNewStation: () => {
    window.document.location.href = '/app/sessions';
  },
  choosePdf: async () => {
    const openPdfPicker = async () => {
      const result = await FilePicker.pickFiles({
        types: ['application/pdf'],
        multiple: false,
        readData: true
      });

      if (result.files.length == 0) {
        return;
      }

      isLoadingPdfAndImages.value = true;

      const file = result.files[0];


      if (dynamicData.value.role == 'doctor') {
        sendWS({
          type: 'public-on-doctor-ready',
          data: {}
        })
        dynamicData.value.stage = 'waiting-start';
        dynamicData.value.tab = 'waiting-start';
      }else{
        const storage = await TStorage.load('StationFile', {
          files: [] 
        });


        const fileOnStorage = storage.data.files.find((filer:any) => {
          return filer.name == file.name;
        })


        if (fileOnStorage) {
          dynamicData.value.texts.actorIndications = fileOnStorage.pageIndexesTexts.actorIndications;
          dynamicData.value.texts.doctorIndications = fileOnStorage.pageIndexesTexts.doctorIndications;
          dynamicData.value.texts.pressings = fileOnStorage.pageIndexesTexts.pressings;
          dynamicData.value.texts.checklist = fileOnStorage.pageIndexesTexts.checklist;
        }
      }
      

      dynamicData.value.pdf.fileName = file.name;

      const url = URL.createObjectURL(file.blob as Blob);
      const sourcePDF = url;

      dynamicData.value.pdf.blobUri = sourcePDF



      if (dynamicData.value.role == 'doctor' || (dynamicData.value.role == 'actor' && dynamicData.value.stage != 'prepare-station')){
        const pagesToBeIncluded = [
          ...dynamicData.value.pageIndexes.actorIndications,
          ...dynamicData.value.pageIndexes.doctorIndications,
          ...dynamicData.value.pageIndexes.pressings,
          ...dynamicData.value.pageIndexes.checklist
        ]
        const pagesToBeIncludedUnique = Array.from(new Set(pagesToBeIncluded));
        const pdf = await PDFModifier.loadPDF(dynamicData.value.pdf.blobUri);
        const imagesBase64 = await pdf.extractPagesAsImagesAsBase64(pagesToBeIncludedUnique);
        dynamicData.value.pdf.pagesAsImages = imagesBase64;
      }


      isLoadingPdfAndImages.value = false;
    };

    const openOnlinePdfPicker = async () => {
      let result;
      if (dynamicData.value.role == 'actor' && dynamicData.value.stage == 'prepare-station') {
        const response = await (async () => {
          return new Promise((resolve, reject) => {
            Dialog.show(Explorer, {
              props: {},
              onLoaded($this) {
                $this.on('selected', (event: any) => {
                  resolve(event.data);
                });
              },
            });
          });
        })() as any;

        result = {
          name: response.id,
          url: response.downloadUrl
        } as any
      }else{
        result = {
          name: dynamicData.value.pdf.fileName,
          url: dynamicData.value.pdf.fileUrl
        }
      }



      const storedFile = null;
      
      isLoadingPdfAndImages.value = true;

      const file = result;

      loadingPdfFileOnline.value = {
        percentage: 0,
        text: 'Baixando materiais da estação...'
      };


      let fetchedOnline;
      let url;

      if (storedFile){
        fetchedOnline = await fetch(storedFile.base64Url);
        url = URL.createObjectURL((await fetchedOnline.blob()) as Blob)
      }else{
        const response = await axios.get(file.url, {
          responseType: 'arraybuffer',
          onDownloadProgress: (progressEvent) => {
            if (!progressEvent.total){
              return;
            }
            const percentage = ((progressEvent.loaded * 100) / progressEvent.total)
            loadingPdfFileOnline.value = {
              percentage: percentage,
              text: `Baixando materiais da estação (${percentage}%)...`
            };
          }
        })

        const blob = new Blob([response.data], {type: 'application/pdf'});

        url = URL.createObjectURL(blob as Blob)
      }

      loadingPdfFileOnline.value = null;

      dynamicData.value.pdf.fileName = file.name;
      dynamicData.value.pdf.fileUrl = file.url;


      if (dynamicData.value.role == 'doctor') {
        sendWS({
          type: 'public-on-doctor-ready',
          data: {}
        })
        dynamicData.value.stage = 'waiting-start';
        dynamicData.value.tab = 'waiting-start';
      }else{
        const storage = await TStorage.load('StationFile', {
          files: [] 
        });


        const fileOnStorage = storage.data.files.find((filer:any) => {
          return filer.name == file.name;
        })

        if (fileOnStorage) {
          dynamicData.value.texts.actorIndications = fileOnStorage.pageIndexesTexts.actorIndications;
          dynamicData.value.texts.doctorIndications = fileOnStorage.pageIndexesTexts.doctorIndications;
          dynamicData.value.texts.pressings = fileOnStorage.pageIndexesTexts.pressings;
          dynamicData.value.texts.checklist = fileOnStorage.pageIndexesTexts.checklist;
        }
      }
      


      const sourcePDF = url;
      dynamicData.value.pdf.blobUri = sourcePDF

      if (dynamicData.value.role == 'doctor' || (dynamicData.value.role == 'actor' && dynamicData.value.stage != 'prepare-station')){
        const pagesToBeIncluded = [
          ...dynamicData.value.pageIndexes.actorIndications,
          ...dynamicData.value.pageIndexes.doctorIndications,
          ...dynamicData.value.pageIndexes.pressings,
          ...dynamicData.value.pageIndexes.checklist
        ]
        const pagesToBeIncludedUnique = Array.from(new Set(pagesToBeIncluded));
        const pdf = await PDFModifier.loadPDF(dynamicData.value.pdf.blobUri);
        const imagesBase64 = await pdf.extractPagesAsImagesAsBase64(pagesToBeIncludedUnique);
        dynamicData.value.pdf.pagesAsImages = imagesBase64;
      }

      isLoadingPdfAndImages.value = false;
    };
    await openOnlinePdfPicker();
  },
  inviteDoctor: async () => {
    startStation();


    if (dynamicData.value.role == 'actor'){
      isLoadingPdfAndImages.value = true;
      const pagesToBeIncluded = [
        ...dynamicData.value.pageIndexes.actorIndications,
        ...dynamicData.value.pageIndexes.doctorIndications,
        ...dynamicData.value.pageIndexes.pressings,
        ...dynamicData.value.pageIndexes.checklist
      ]
      const pagesToBeIncludedUnique = Array.from(new Set(pagesToBeIncluded));
      const pdf = await PDFModifier.loadPDF(dynamicData.value.pdf.blobUri);
      const imagesBase64 = await pdf.extractPagesAsImagesAsBase64(pagesToBeIncludedUnique);
      dynamicData.value.pdf.pagesAsImages = imagesBase64;


      if (dynamicData.value.pageIndexes.pressings.length > 0) {
        viewsDynamicData.value.indications.currentPage = dynamicData.value.pageIndexes.pressings[0];
      }
      isLoadingPdfAndImages.value = false;

    }


    dynamicData.value.stage = 'waiting-doctor';
    dynamicData.value.tab = 'waiting-doctor';
  },
  allowPressing: async (ev: MouseEvent, index: number) => {
    if (!dynamicData.value.pageIndexes.allowedPressings.includes(index)) {
      dynamicData.value.pageIndexes.allowedPressings.push(index);
    }
    sendStationData('allow-pressing', () => {
      toastController.create({
        message: '📤 Impresso enviado ao médico',
        duration: 1000
      }).then(toast => toast.present());
    });
  },
  onDoctorArrived: async () => {
    if (dynamicData.value.role == 'doctor') {
      actions.choosePdf();
    }else{
      dynamicData.value.stage = 'waiting-doctor-ready';
      dynamicData.value.tab = 'waiting-doctor-ready';
    }
  },
  startStation: async () => {
    dynamicData.value.stage = 'ongoing-station';
    dynamicData.value.tab = 'indications';

    if (dynamicData.value.role == 'actor'){
      actions.startCronometer();
      sendWS({
        type: 'public-on-station-start',
        data: getStationData()
      });
      sendStationData();
    }
  },
  resumeStation: async () => {
    if (dynamicData.value.role == 'actor'){
      sendWS({
        type: 'public-on-station-start',
        data: getStationData()
      });
      sendStationData();
    }
  },
  copyShareLink: async () => {
    //Generate URL based on the current url, but add a query paramenter with: role=doctor:
    const url = new URL(window.location.href);
    url.searchParams.set('role', 'doctor');
    navigator.clipboard.writeText(url.toString());
    toastController.create({
      message: '✅ Link copiado para a área de transferência',
      duration: 2000
    }).then(toast => toast.present());
  },
  startCronometer: async () => {
    const stopAt = new Date();
    stopAt.setSeconds(stopAt.getSeconds() + (10 * 60));
    dynamicData.value.cronometer.stopAt = stopAt.toISOString();
  },
  stopCronometer: async () => {
    dynamicData.value.cronometer.stopAt = null;
  },
  finishStation: async () => {
    actions.stopCronometer();

    dynamicData.value.stage = 'finished-station';
    dynamicData.value.tab = 'checklist';
    dynamicData.value.cronometer.stopAt = null;
    if (dynamicData.value.role == 'doctor'){
      alertController.create({
        header: 'Estação finalizada!',
        message: 'A estação terminou. Agora você pode revisar o checklist!',
        buttons: ['OK']
      }).then(alert => alert.present());

      sendWS({
        type: 'public-on-station-finish',
        data: {}
      })
    }
  },
  addPontuation: async (points: number) => {
    dynamicData.value.checklist.pontuation += points;
    lastPontuationSum.push(points);
    sendStationData('add-pontuation');
  },
  removePontuation: async () => {
    if (lastPontuationSum.length > 0) {
      dynamicData.value.checklist.pontuation -= lastPontuationSum.pop();
      sendStationData('remove-pontuation');
    }
  }
}




const startStation = async () => {
  const extractPagesFromString = (text:string) => {
    //Rules:

    //1. Remove all non-numeric characters, including spaces, except commas and hyphens:
    //2. Like the Chrome print page, the pages are separated by commas and range of pages are separated by hyphens, so, extract every single page and range of pages (the range of pages should be converted to single pages):
    const onlyNumbers = text.replace(/[^0-9,-]/g, '');
    const pages = onlyNumbers.split(',').map((page) => {
      if (page.includes('-')) {
        const [start, end] = page.split('-').map((n) => parseInt(n));
        return Array.from({length: (end - start) + 1}, (_, i) => i + start);
      }else{
        return parseInt(page);
      }
    }).flat().filter((page) => page >= 1);

    //3. Remove duplicates:
    const pagesWithoutDuplicates = Array.from(new Set(pages));

    return pagesWithoutDuplicates;
  }

  const actorIndications = extractPagesFromString(dynamicData.value.texts.actorIndications).map((index) => (index - 1));
  const doctorIndications = extractPagesFromString(dynamicData.value.texts.doctorIndications).map((index) => (index - 1));
  const pressings = extractPagesFromString(dynamicData.value.texts.pressings).map((index) => (index - 1));
  const checklist = extractPagesFromString(dynamicData.value.texts.checklist).map((index) => (index - 1));

  dynamicData.value.pageIndexes.actorIndications = actorIndications;
  dynamicData.value.pageIndexes.doctorIndications = doctorIndications;
  dynamicData.value.pageIndexes.pressings = pressings;
  dynamicData.value.pageIndexes.checklist = checklist;

  checklist.forEach((index) => {
    dynamicData.value.checklist.pages[index] = {
      index,
      points: []
    }
  })


  const storage = await TStorage.load('StationFile', {
      files: [] 
    });

    storage.data.files = storage.data.files.filter((file:any) => {
      return file.name != dynamicData.value.pdf.fileName;
    })
    storage.data.files.push({
      name: dynamicData.value.pdf.fileName,
      pageIndexesTexts: {
        actorIndications: dynamicData.value.texts.actorIndications,
        doctorIndications: dynamicData.value.texts.doctorIndications,
        pressings: dynamicData.value.texts.pressings,
        checklist: dynamicData.value.texts.checklist
      }
    })

  await storage.save();
}

const clickOnChecklistPage = (ev: MouseEvent, index: number) => {
  if (dynamicData.value.role == 'doctor') {
    return;
  }
  const page = dynamicData.value.checklist.pages[index];
  const x = ev.offsetX - (32/2);
  const y = ev.offsetY - (32/2);
  page.points.push({x, y});

  sendStationData('checklist-mark');
}


const clickOnButtonOnChecklistPage = (ev: MouseEvent, index: number, point: {x: number, y: number}) => {
  if (dynamicData.value.role == 'doctor') {
    return;
  }
  const page = dynamicData.value.checklist.pages[index];
  const indexPoint = page.points.indexOf(point);
  page.points.splice(indexPoint, 1);
  ev.stopPropagation();

  sendStationData('checklist-mark');
}
class PDFModifier{
    private pdf: PDFDocumentProxy;


    public constructor(PDFDocumentProxy: PDFDocumentProxy){      
        this.pdf = PDFDocumentProxy;
    }


    public async extractPagesAsImagesAsBase64(pagesIndices: number[] = []){
        let listImagesBase64: string[] = [];
        const canvas = document.createElement('canvas');
        for (let i = 0; i < this.pdf.numPages; i++) {
            if (pagesIndices.length > 0 && !pagesIndices.includes(i)) {
              listImagesBase64.push('null');
              continue;
            }
            const page = await this.pdf.getPage(i+1);
            const viewport = page.getViewport({scale: 2});
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const context = canvas.getContext('2d');
            await page.render({canvasContext: context, viewport}).promise;
            
            const imageData = canvas.toDataURL('image/png');
            listImagesBase64.push(imageData);
        }
        return listImagesBase64;
    }

    public static async loadPDF(source: any): Promise<PDFModifier>{
        return new Promise((resolve, reject) => {
            const loadingTask = createLoadingTask(source);
            loadingTask.promise.then((pdf: PDFDocumentProxy) => {
                resolve(new PDFModifier(pdf))
            }).catch((error: any) => {
                reject(error)
            })
        })
    }
}


const getStationData = () => {
  return {
    from: dynamicData.value.role,
    stage: dynamicData.value.stage,
    pageIndexes: dynamicData.value.pageIndexes,
    checklist: dynamicData.value.checklist,
    pdfFileName: dynamicData.value.pdf.fileName,
    pdfFileUrl: dynamicData.value.pdf.fileUrl,
    cronometer: dynamicData.value.cronometer
  }
}

const updateStationData = (data: any) => {
  dynamicData.value.stage = data.stage;
  dynamicData.value.pageIndexes = data.pageIndexes;
  dynamicData.value.checklist = data.checklist;
  dynamicData.value.pdf.fileName = data.pdfFileName;
  dynamicData.value.pdf.fileUrl = data.pdfFileUrl;
  dynamicData.value.cronometer = data.cronometer;
}


const userIntendedCloseWsConnection = ref<boolean>(false);
let ws:null|WebSocket = null;

const connectToWebSocket = () => {
  ws = new WebSocket(websocketUrl);
  ws.onopen = () => {
    ws?.send(JSON.stringify({
      type: 'register',
      id: dynamicData.value.connectionId
    }))
  };
  ws.onmessage = async (response) => {
    //Check if response.data is a string or a Blob, if it is a Blob, convert it to a string:
    let data = null;
    if (response.data instanceof Blob) {
      const buffer = await response.data.arrayBuffer();
      data = new TextDecoder().decode(buffer);
    }else{
      data = response.data;
    }

    const event = JSON.parse(data) as any;
    if (event.type in wsEvents) {
      console.log('Received event:', event);

      if (event.connectionId && event.connectionId != dynamicData.value.connectionId) {
        return;
      }
      (wsEvents as any)[event.type](event);
    }
  };

  ws.onclose = () => {
    if (userIntendedCloseWsConnection.value){
      return;
    }
    console.log('Connection lost');
    console.log('Trying to reconnect...');
    setTimeout(() => {
      connectToWebSocket();
    }, 1000);
  };
}

connectToWebSocket();


const sendWS = (data: any) => {
  const dataInfo = JSON.parse(JSON.stringify(data));

  dataInfo.connectionId = dynamicData.value.connectionId;

  console.log('Sending:', dataInfo);
  ws?.send(JSON.stringify(dataInfo));
}

let sendStationDataCallbacks:Array<{
  hash: string,
  callback: Function
}> = [];

const sendStationData = async (action: string|null = null, onReceived: Function|null = null) => {
  const stationData = getStationData();
  const hash = new Sha256();
  hash.update(JSON.stringify(getStationData()));
  const result = await hash.digest();


  sendWS({
    type: 'public-on-station-data',
    data: {
      ...stationData,
      action: action,
      hash: result.toString()
    }
  })
  if (onReceived) {
    sendStationDataCallbacks.push({
      hash: result.toString(),
      callback: onReceived
    });
  }
}
onMounted(() => {
  stationCronometer.value.interval = setInterval(() => {
      if (dynamicData.value.cronometer.stopAt == null) {
        return;
      }
      const stopAt = new Date(dynamicData.value.cronometer.stopAt as string);
      const now = new Date();
      const diff = stopAt.getTime() - now.getTime();
      stationCronometer.value.time = Math.floor(diff / 1000);

      //Check if the time is over:
      if (diff <= 0) {
        dynamicData.value.cronometer.stopAt = null;
        actions.finishStation();
      }
  }, 1000);
})


let hasReceivedOnStationDataBefore:boolean = false;

const wsEvents = {
  'new-connection': () => {
    if (dynamicData.value.role == 'actor') {
    }
    console.log('New connection');
    sendStationData();
  },
  'public-on-doctor-ready': (event: any) => {
    if (dynamicData.value.role == 'actor' && dynamicData.value.stage == 'waiting-doctor') {
      dynamicData.value.stage = 'waiting-start';
      dynamicData.value.tab = 'indications';
    }

    if (dynamicData.value.role == 'actor' && dynamicData.value.stage == 'ongoing-station') {
      actions.resumeStation();
    }

    if (dynamicData.value.role == 'actor' && dynamicData.value.stage == 'finished-station') {
      actions.resumeStation();
    }
  },
  'public-on-station-start': (event: any) => {
    if (dynamicData.value.role == 'doctor') {
      actions.startStation();
    }
  },
  'public-on-station-finish': (event: any) => {
    if (dynamicData.value.role == 'actor') {
      actions.finishStation();

      alertController.create({
        header: 'Estação finalizada!',
        message: 'A estação terminou. Agora você pode revisar o checklist!',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  },
  'public-on-station-data-received': (event: any) => {
    const callback = sendStationDataCallbacks.find((callback) => {
      return callback.hash == event.data.hash;
    });

    if (callback) {
      callback.callback();
    }

    //Remove the callback from the list:
    sendStationDataCallbacks = sendStationDataCallbacks.filter((callback) => {
      return callback.hash != event.data.hash;
    });
  },
  'public-on-station-data': async (event: any) => {
    if (dynamicData.value.role == 'doctor'){
        console.log('Received publiconstationdata:', event.data);
        if (event.data.from == 'actor' && event.data.stage == 'waiting-doctor') {
          updateStationData(event.data);
          actions.onDoctorArrived();
          sendWS({
            type: 'public-on-doctor-arrived',
            data: getStationData()
          })
      }

      if (event.data.from == 'actor' && event.data.stage == 'ongoing-station') {
        updateStationData(event.data);

        if (event.data.action == 'allow-pressing') {
          viewsDynamicData.value.indications.currentPage = event.data.pageIndexes.allowedPressings[event.data.pageIndexes.allowedPressings.length - 1];
          dynamicData.value.tab = 'pressings';
        }
      }

      if (!hasReceivedOnStationDataBefore){
        if (event.data.stage == 'ongoing-station'){
          updateStationData(event.data);
          await actions.choosePdf();
        }
        if (event.data.stage == 'waiting-start'){
          updateStationData(event.data);
          await actions.choosePdf();
        }
        if (event.data.stage == 'finished-station'){
          updateStationData(event.data);
          await actions.choosePdf();
        }
      }

      if (event.data.from == 'actor' && (event.data.stage == 'finished-station')) {
        updateStationData(event.data);
      }
    }

    if (dynamicData.value.role == 'actor' && event.data.from == 'doctor'){
      if (!hasReceivedOnStationDataBefore){
        if (event.data.stage == 'ongoing-station'){
          updateStationData(event.data);
          await actions.choosePdf();
          updateStationData(event.data);
          dynamicData.value.tab = 'indications';
        }
        if (event.data.stage == 'waiting-start'){
          updateStationData(event.data);
          await actions.choosePdf();
          updateStationData(event.data);
          dynamicData.value.stage = 'waiting-start';
          dynamicData.value.tab = 'indications';
        }
        if (event.data.stage == 'finished-station'){
          updateStationData(event.data);
          await actions.choosePdf();
          updateStationData(event.data);
          dynamicData.value.tab = 'checklist';
        }
      }
    }
    
    if (!hasReceivedOnStationDataBefore){
      hasReceivedOnStationDataBefore = true;
    }


    if (dynamicData.value.role != event.data.from){
      sendWS({
        type: 'public-on-station-data-received',
        data: {
          hash: event.data.hash
        }
      })
    }

  }
}
onUnmounted(() => {
  userIntendedCloseWsConnection.value = true;
  ws?.close();
  clearInterval(stationCronometer.value.interval);
})
</script>



<style scoped lang="scss">


.section-with-sidebar{
  display: flex;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    > aside{
      width: 300px;
    }

    > main{
      flex: 1;
      width: max-content;
    }
}

.section-with-sidebar-with-header{
  display: flex;
  flex-direction: column;
  > header{
    width: 100%;
  }

  > article{
    display: flex;
    position: absolute;
    top: 55px;
    left: 0;
    right: 0;
    bottom: 0;
    > aside{
      width: 300px;
    }

    > main{
      flex: 1;
      width: max-content;
    }
  }
}

.section-with-sidebar-gallery{
  display: flex;
  > aside{
    width: 170px;
  }

  > main{
    flex: 1;
    width: max-content;
    display: flex;
    align-items: center;
    justify-content: center;
    > img{
      max-height: 700px;
    }
  }
}


.checklist-page{
  position: relative;
  > section{
    cursor: pointer;
  }

  > ion-button{
    position: absolute;
  }
}


.view-page{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;

  display: flex;
  flex-direction: column;

  > main{
    height: 100%;
  }
}

</style>
