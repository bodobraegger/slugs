from otree.api import *


doc = """
survey
"""


class C(BaseConstants):
    NAME_IN_URL = 'survey'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 75
    LIKERT_5_CHOICES = ['Strongly disagree', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Strongly Agree']
    LIKERT_4_CHOICES = LIKERT_5_CHOICES[0:2]+LIKERT_5_CHOICES[3:5]
    LIKERT_4_CHOICES_B = ['Not at all', 'Only a little', 'Pretty much', 'A lot']

def read_csv(path):
    import csv

    f = open(path, encoding='utf-8-sig')
    rows = list(csv.DictReader(f))
    return rows


def creating_session(subsession):
    subsession.session.vars['questionnaire_rows'] = read_csv(subsession.session.config.get('questionnaire'))
    subsession.session.vars['empty_row_indices'] = []
    for i, r in enumerate(subsession.session.vars['questionnaire_rows']):
        if r.get('scale') == '':
            subsession.session.vars['empty_row_indices'] += [i]
    
    subsession.session.vars['empty_row_indices'] += [len(subsession.session.vars['questionnaire_rows'])]

class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    questionnaire = models.StringField(blank=True, initial='')
    scale = models.StringField(blank=True, initial='')
    question = models.StringField(blank=True, initial='')


class Player(BasePlayer):
    answer = models.IntegerField(blank=True)


class PageInherit(Page):
    form_model = 'player'

# PAGES
class MyPage(PageInherit):
    form_model = 'player'
    form_fields = ['answer']
    def vars_for_template(player):
        num_questions = 0
        cur_ind = -1
        for i, end_ind in enumerate(player.session.vars['empty_row_indices']):
            if player.round_number <= end_ind:
                num_questions = end_ind
                cur_ind = i-1
                break
        if cur_ind < 0:
            cur_question = player.round_number
        else:
            cur_question = player.round_number-1-player.session.vars['empty_row_indices'][cur_ind]
            num_questions = num_questions-1 - player.session.vars['empty_row_indices'][cur_ind]
        return {'cur_question':cur_question,'num_questions': num_questions}

    def is_displayed(player):
        if(player.round_number-1) < len(player.session.vars['questionnaire_rows']):
            player.group.questionnaire = player.session.vars['questionnaire_rows'][player.round_number-1].get('questionnaire')
            player.group.scale = player.session.vars['questionnaire_rows'][player.round_number-1].get('scale')
            if player.group.scale == 'likert5':
                player.session.vars['scale'] = C.LIKERT_5_CHOICES.copy()
            elif player.group.scale == 'likert4':
                player.session.vars['scale'] = C.LIKERT_4_CHOICES.copy()
            elif player.group.scale == 'likert4b':
                player.session.vars['scale'] = C.LIKERT_4_CHOICES_B.copy()
                
            player.group.question = player.session.vars['questionnaire_rows'][player.round_number-1].get('question')

        return player.round_number-1 < len(player.session.vars['questionnaire_rows']) and player.group.question != ''


class Intro(Page):
    def is_displayed(player):
        try:
            prev = player.in_round(player.round_number-1)
            return player.round_number == 1 or (prev.group.questionnaire == '' and player.round_number < len(player.session.vars['questionnaire_rows']))
        except Exception as e:
            return True   

class Outro(Page):
    def is_displayed(player):
        return player.round_number-1 in player.session.vars['empty_row_indices']
page_sequence = [Intro, MyPage, Outro]