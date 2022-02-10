from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants

class PageInherit(Page):
    form_model = 'player'

# PAGES
class Section1(PageInherit):
    template_name='learning/Section.html'
    form_fields = ['fruit_not_fit', 'fruit_combine', 'fruit_instruction_change', 'leaf_combine', 'leaf_correct_instructions_1', 'leaf_correct_instructions_2', 'leaf_instruction_change',]
    def vars_for_template(player):
        return {'section_number': 1}

class Section2(Section1):
    form_fields = ['shampoo', 'watering', 'thefarm']
    def vars_for_template(player):
        return {'section_number': 2}

class Section3(PageInherit):
    form_fields = ['js_ifelse', 'js_while', 'js_fizzbuzz']
    def is_displayed(player):
        return player.subsession.session.config.get('include_js_test') == True
    def vars_for_template(player):
        return {'section_number': 3}
    def app_after_this_page(self, upcoming_apps):
        if self.participant.vars.get('show_demographics'):
            return upcoming_apps[0]
        else:
            return upcoming_apps[-1]

class Intro(Page):
    def is_displayed(player):
        try:
            prev = player.in_round(player.round_number-1)
            return player.round_number == 1 or (prev.group.questionnaire == '' and player.round_number < len(player.session.vars['questionnaire_rows']))
        except Exception as e:
            return True   

page_sequence = [Intro, Section1, Section2, Section3]