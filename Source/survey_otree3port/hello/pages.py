from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants

class Intro(Page):
    form_model = 'player'
    form_fields = ['questionnaire_pre_code']
    def before_next_page(self):
        if len(self.player.questionnaire_pre_code) != 8:
            self.participant.vars['show_demographics'] = True

        return super().before_next_page()

page_sequence = [Intro]