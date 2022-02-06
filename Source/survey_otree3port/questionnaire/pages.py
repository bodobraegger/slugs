from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants

class PageInherit(Page):
    form_model = 'player'

# PAGES
class MyPage(PageInherit):
    form_model = 'player'
    form_fields = ['answer']
    def vars_for_template(self):
        num_questions = 0
        cur_ind = -1
        for i, end_ind in enumerate(self.player.session.vars['empty_row_indices']):
            if self.player.round_number <= end_ind:
                num_questions = end_ind
                cur_ind = i-1
                break
        if cur_ind < 0:
            cur_question = self.player.round_number
        else:
            cur_question = self.player.round_number-1-self.player.session.vars['empty_row_indices'][cur_ind]
            num_questions = num_questions-1 - self.player.session.vars['empty_row_indices'][cur_ind]
        return {'cur_survey': cur_ind+2, 'num_surveys': len(self.player.session.vars['empty_row_indices']),'cur_question':cur_question,'num_questions': num_questions}

    def is_displayed(self):
        if(self.player.round_number-1) < len(self.player.session.vars['questionnaire_rows']):
            self.player.group.questionnaire = self.player.session.vars['questionnaire_rows'][self.player.round_number-1].get('questionnaire')
            self.player.group.scale = self.player.session.vars['questionnaire_rows'][self.player.round_number-1].get('scale')
            if self.player.group.scale == 'likert5':
                self.player.session.vars['scale'] = Constants.LIKERT_5_CHOICES.copy()
            elif self.player.group.scale == 'likert4':
                self.player.session.vars['scale'] = Constants.LIKERT_4_CHOICES.copy()
            elif self.player.group.scale == 'likert4b':
                self.player.session.vars['scale'] = Constants.LIKERT_4_CHOICES_B.copy()
                
            self.player.group.question = self.player.session.vars['questionnaire_rows'][self.player.round_number-1].get('question')

        return self.player.round_number-1 < len(self.player.session.vars['questionnaire_rows']) and self.player.group.question != ''


class Intro(Page):
    def is_displayed(self):
        try:
            prev = self.player.in_round(self.player.round_number-1)
            return self.player.round_number == 1 or (prev.group.questionnaire == '' and self.player.round_number < len(self.player.session.vars['questionnaire_rows']))
        except Exception as e:
            return True   

class Outro(Page):
    def is_displayed(player):
        return player.round_number-1 in player.session.vars['empty_row_indices']
page_sequence = [Intro, MyPage, Outro]