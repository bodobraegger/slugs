from otree.api import *


doc = """
survey
"""


class C(BaseConstants):
    NAME_IN_URL = 'survey'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1
    LIKERT_5_CHOICES = [[-2, 'Strongly disagree'],[-1, 'Disagree'],[0, 'Neither agree nor disagree'],[1, 'Agree'],[2, 'Strongly Agree']]
    LIKERT_4_CHOICES = LIKERT_5_CHOICES


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    test = models.IntegerField(widget=widgets.RadioSelectHorizontal, label='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', choices= C.LIKERT_5_CHOICES)


class PageInherit(Page):
    form_model = 'player'

# PAGES
class MyPage(PageInherit):
    form_model = 'player'
    form_fields = ['test']

class Intro(Page):
    pass

page_sequence = [Intro, MyPage]