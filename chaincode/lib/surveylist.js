
'use strict';

const StateList = require('../ledger-api/statelist.js');

const Survey = require('./Survey.js');
const SurveyInfo = require('./SurveyInfo.js');
const SurveyQuestion = require('./SurveyQuestion.js');

class SurveyList extends StateList {

    constructor(ctx) {
        super(ctx);
        this.use(SurveyInfo);
        this.use(SurveyQuestion);
    }

    async addSurvey(survey) {
        const surveyInfo = survey.getSurveyInfo();
        const questions = survey.getQuestions();

        await this.addState(surveyInfo);
        for (const question of questions) {
            await this.addState(question);
        }
    }

    async getSurvey(surveyInfoKey) {
        const surveyInfo = await this.getState(surveyInfoKey);

        const surveyKey = Survey.makeSurveyKeyByInfoKey(surveyInfoKey);
        const questionsKey = SurveyQuestion.makeKey([surveyKey]);
        const questions = await this.getStatesByPartialKey(questionsKey);

        return new Survey({ surveyInfo, questions });
    }

    async getSurveyInfo(surveyInfoKey) {
        return this.getState(surveyInfoKey);
    }

    async getSurveyInfosByDepartment(department) {
        const surveyInfosKey = SurveyInfo.makeKey([department]);
        const surveyInfos = await this.getStatesByPartialKey(surveyInfosKey);
        return surveyInfos;
    }

    async getSurveyInfosByDepartmentWithPagination(department, pageSize, surveyBookmark) {
        const surveyInfosKey = SurveyInfo.makeKey([department]);
        const surveyInfos = await this.getStatesByPartialKeyWithPagination(surveyInfosKey, pageSize, surveyBookmark);
        return surveyInfos;
    }

    async getSurveyInfosByRange(surveyInfoStart, surveyInfoEnd) {
        return await this.getStatesByRange(surveyInfoStart, surveyInfoEnd);
    }

    async getSurveyInfosByRangeWithPagination(surveyInfoStart, surveyInfoEnd, pageSize, surveyBookmark) {
        return await this.getStatesByRangeWithPagination(surveyInfoStart, surveyInfoEnd, pageSize, surveyBookmark);
    }

    async updateSurvey(survey) {
        const surveyInfo = survey.getSurveyInfo();
        const questions = survey.getQuestions();
        const surveyKey = survey.getSurveyKey();

        await this.updateState(surveyInfo);
        await this.deleteQuestions(surveyKey);
        for (const question of questions) {
            await this.addState(question);
        }
    }

    async updateSurveyInfo(surveyInfoKey) {
        await this.updateState(surveyInfoKey);
    }

    async deleteQuestions(surveyKey) {
        const questionsKey = SurveyQuestion.makeKey([surveyKey]);
        const questions = await this.getStatesByPartialKey(questionsKey);

        for (const question of questions) {
            await this.deleteState(question.getKey());
        }
    }

    static makeSurveyBookmark(department, createdAt) {
        const surveyInfoKey = SurveyInfo.makeKey([department, createdAt]);
        return StateList.makeBookmark(surveyInfoKey);
    }

    static getUnremovedFromSurveyInfos(surveyInfos) {
        return surveyInfos.filter(surveyInfo => !surveyInfo.isRemoved());
    }

    async setSurveyEvent(action, surveyInfo) {
        const eventName = 'survey' + action + 'Event';
        await this.setEvent(eventName, surveyInfo);
    }
}

module.exports = SurveyList;