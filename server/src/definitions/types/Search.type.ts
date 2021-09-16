export interface SearchField {
    type: SearchType
    field: string
    value: string
}

export const SearchTypes = [
    'equals',
    'contains',
    'starts_with',
    'ends_with',
    'equals_not',
    'contains_not',
    'starts_not_with',
    'ends_not_with',
    'before_previous',
    'within_previous',
    'within_next',
    'after_upcoming'
]

type SearchType =
    'equals' |
    'contains' |
    'starts_with' |
    'ends_with' |
    'equals_not' |
    'contains_not' |
    'starts_not_with' |
    'ends_not_with' |
    'before_previous' |
    'within_previous' |
    'within_next' |
    'after_upcoming'

////////////////////////////
////////////////////////////