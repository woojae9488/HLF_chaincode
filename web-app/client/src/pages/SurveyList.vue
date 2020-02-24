<template>
  <div class="SurveyList">
    <h2 class="pb-4">{{title}}</h2>

    <template v-if="isManager">
      <b-container fluid>
        <b-row class="my-3">
          <b-col sm="4">
            <b-button to="/ManagerSignup" variant="outline-primary" size="sm">Add Manager</b-button>
          </b-col>
          <b-col sm="4" offset-sm="4">
            <b-button to="/MakeSurvey" variant="outline-primary" size="sm">Add Survey</b-button>
          </b-col>
        </b-row>
      </b-container>
    </template>

    <b-card no-body>
      <b-tabs card>
        <b-tab
          v-for="index in surveyInfos.indexs"
          :key="index"
          :title="index"
          @click="onClickSurveyIndex"
        >
          <b-table
            :items="surveyInfos.lists[surveyTable.index]"
            :fields="surveyTable.fields"
            :current-page="surveyTable.currentPage"
            :per-page="surveyTable.perPage"
            @row-clicked="onClickSurveyInfo"
            hover
            show-empty
          >
            <template v-slot:table-colgroup="scope">
              <col
                v-for="field in scope.fields"
                :key="field.key"
                :style="{ width: field.key === 'title' ? '140px' : '50px' }"
              />
            </template>
          </b-table>

          <b-row class="my-1" align-h="center">
            <b-col sm="7">
              <b-pagination
                v-model="surveyTable.currentPage"
                :total-rows="surveyTable.totalRows"
                :per-page="surveyTable.perPage"
                align="fill"
                size="sm"
              ></b-pagination>
            </b-col>
          </b-row>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import surveyService from "@/services/surveyApi.js";
import eventBus from "@/utils/eventBus.js";

export default {
  name: "SurveyList",
  async created() {
    eventBus.$emit("runSpinner");

    this.userData = api.getData("user");
    this.userData.role = api.getData("role");
    await this.initSurveyLists();

    eventBus.$emit("hideSpinner");
  },
  data() {
    return {
      title: "Survey List",
      userData: {},
      surveyInfos: {
        indexs: [],
        lists: []
      },
      surveyState: ["registered, surveying, finished"],
      surveyTable: {
        index: 0,
        totalRows: 1,
        perPage: 7,
        currentPage: 1,
        fields: [
          { key: "currentState", sortable: true },
          { key: "title", sortable: false },
          { key: "startDate", sortable: true },
          { key: "endDate", sortable: true }
        ]
      }
    };
  },
  computed: {
    isStudent() {
      return this.userData.role === "student";
    },
    isManager() {
      return this.userData.role === "manager";
    }
  },
  methods: {
    async initSurveyLists() {
      try {
        for (const department of this.userData.departments) {
          const apiRes = await surveyService.queryList(department);
          const apiData = api.getResultData(apiRes);
          const rowData = this.changeInfoToRowData(apiData);
          this.surveyInfos.indexs.push(department);
          this.surveyInfos.lists.push(rowData);
        }

        this.surveyTable.totalRows = this.surveyInfos.lists[0].length;
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert("Loading survey list fail");
      }
    },

    onClickSurveyInfo(item) {
      if (this.isStudent) {
        this.$router.push(`/Reply${item.path}/${this.userData.id}`);
      } else if (this.isManager) {
        this.$router.push(`/Survey${item.path}`);
      }
    },

    onClickSurveyIndex(event) {
      const indexName = event.target.innerHTML;
      const index = this.surveyInfos.indexs.indexOf(indexName);
      const totalRows = this.surveyInfos.lists[index].length;
      this.surveyTable.index = index;
      this.surveyTable.totalRows = totalRows;
      this.surveyTable.currentPage = 1;
    },

    changeInfoToRowData(info) {
      info.path = `/${info.department}/${info.createdAt}`;
      for (const key in info) {
        if (key === "currentState") {
          info[key] = this.surveyState(info[key] - 1);
        } else if (key === "startDate" || key === "finishDate") {
          info[key] = this.getFormatedDate(info[key]);
        }
      }
      return info;
    },

    getFormatedDate(time) {
      // yy.MM.dd HH:mm
      const d = new Date(time);
      return (
        (d.getFullYear() % 1000) +
        "." +
        (d.getMonth() + 1) +
        "." +
        d.getDate() +
        " " +
        d.getHours() +
        ":" +
        d.getMinutes()
      );
    }
  }
};
</script>