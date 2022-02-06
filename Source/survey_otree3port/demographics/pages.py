from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants

class PageInherit(Page):
    form_model = 'player'

# PAGES
class MyPage(PageInherit):
    form_model = 'player'
    form_fields = ['gender', 'age', 'mother_tongue', 'english_understanding', 'math_grade', 'video_games', 'cs_experience', 'js_experience',]

page_sequence = [MyPage]