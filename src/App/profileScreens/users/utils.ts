import { SetT } from './userTypes'

export function filterSetsByName(sets: SetT[], searchString: string) {
    if (!searchString) {
        return sets
    }
    const text = searchString.toLowerCase().trim()
    return sets.filter(({ title }) => {
        return title.toLowerCase().indexOf(text) !== -1
    })
}
