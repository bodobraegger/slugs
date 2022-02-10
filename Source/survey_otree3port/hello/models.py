from otree.api import *

doc = """
'hello'
"""


class Constants(BaseConstants):
    name_in_url = 'hello'
    players_per_group = None
    num_rounds = 1
    


class Subsession(BaseSubsession):
    pass

class Group(BaseGroup):
    pass


class Player(BasePlayer):
    questionnaire_pre_code = models.StringField(label="Please copy and paste the <code>anonymous participant code</code> (mix of 8 letters and numbers) here that you received on the last page of the questionnaire you have completed at home. If you did not write the code down (and you can't find the link in your browser history or need help), or did not complete the home questionniare, please raise your hand.")
