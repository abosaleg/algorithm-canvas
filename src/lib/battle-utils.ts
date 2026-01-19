
export const generateRandomArray = (size: number): number[] => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
};

export const generateSortedArray = (size: number): number[] => {
    return Array.from({ length: size }, (_, i) => Math.floor((i / size) * 100) + 1);
};

export const generateReverseArray = (size: number): number[] => {
    return generateSortedArray(size).reverse();
};

export const generateNearlySortedArray = (size: number): number[] => {
    const arr = generateSortedArray(size);
    // Swap a few elements
    for (let i = 0; i < Math.floor(size / 5); i++) {
        const idx1 = Math.floor(Math.random() * size);
        const idx2 = Math.floor(Math.random() * size);
        [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
    }
    return arr;
};

export const getBattleInput = (type: 'random' | 'sorted' | 'reverse' | 'nearly-sorted', size: number) => {
    switch (type) {
        case 'sorted': return { array: generateSortedArray(size) };
        case 'reverse': return { array: generateReverseArray(size) };
        case 'nearly-sorted': return { array: generateNearlySortedArray(size) };
        case 'random':
        default: return { array: generateRandomArray(size) };
    }
}
