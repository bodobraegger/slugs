from os import environ

SESSION_CONFIGS = [
    # dict(
    #     name='public_goods',
    #     app_sequence=['public_goods'],
    #     num_demo_participants=3,
    # ),
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00, participation_fee=0.00, doc=""
)

PARTICIPANT_FIELDS = []
SESSION_FIELDS = []

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = '8398568838707'


from os import environ

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=0.000, participation_fee=0.00, doc=""
)

SESSION_CONFIGS = [
    dict(
        name='question_with_other_option',
        display_name="Menu with an 'other' option that lets you type in a valueInput manually",
        num_demo_participants=4,
        app_sequence=['question_with_other_option'],
    ),
    dict(
        name='multi_select',
        display_name="Multi-select widget (a.k.a. multiple choice / multiple answer)",
        num_demo_participants=1,
        app_sequence=['multi_select'],
    ),
    dict(
        name='multi_select_complex',
        display_name="Multi-select widget (flexible version with custom labels & 'select at least N')",
        num_demo_participants=1,
        app_sequence=['multi_select_complex'],
    ),
    dict(
        name='questions_from_csv_simple',
        display_name='Quiz questions loaded from CSV spreadsheet (simple version)',
        num_demo_participants=2,
        app_sequence=['questions_from_csv_simple'],
    ),
    dict(
        name='questions_from_csv',
        display_name='Quiz questions loaded from CSV spreadsheet (complex version)',
        num_demo_participants=2,
        app_sequence=['questions_from_csv_complex'],
    ),
    dict(
        name='radio_switching_point',
        display_name='Radio button table with single switching point (strategy method)',
        num_demo_participants=1,
        app_sequence=['radio_switching_point'],
    ),
    dict(
        name='radio',
        display_name="Radio buttons in various layouts, looping over radio choices",
        app_sequence=['radio'],
        num_demo_participants=1,
    ),
]

