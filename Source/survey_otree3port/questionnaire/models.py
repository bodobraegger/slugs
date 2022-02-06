from otree.api import *

doc = """
questionnaire
"""


class Constants(BaseConstants):
    name_in_url = 'questionnaire'
    players_per_group = None
    num_rounds = 75
    LIKERT_5_CHOICES = ['Strongly disagree', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Strongly Agree']
    LIKERT_4_CHOICES = LIKERT_5_CHOICES[0:2]+LIKERT_5_CHOICES[3:5]
    LIKERT_4_CHOICES_B = ['Not at all', 'Only a little', 'Pretty much', 'A lot']


class Subsession(BaseSubsession):
    def creating_session(self):
        if(self.round_number==1):

            self.session.vars['questionnaire_rows'] = read_csv(self.session.config.get('questionnaire'))
            self.session.vars['empty_row_indices'] = []
            for i, r in enumerate(self.session.vars['questionnaire_rows']):
                if r.get('scale') == '':
                    self.session.vars['empty_row_indices'] += [i]
        
            # subsession.session.vars['empty_row_indices'] += [len(subsession.session.vars['questionnaire_rows'])]


def read_csv(path):
    import csv

    f = open(path, encoding='utf-8-sig')
    rows = list(csv.DictReader(f))
    return rows


class Group(BaseGroup):
    questionnaire = models.StringField(blank=True, initial='')
    scale = models.StringField(blank=True, initial='')
    question = models.StringField(blank=True, initial='')


class Player(BasePlayer):
    answer = models.IntegerField(blank=True)
