export function productExponent(x: number, m: number, y: number, n: number): number{

    const result = Math.pow(x, m) * Math.pow(y,n);

    return result
}

export function quotientExponent(x: number, m: number, y: number, n: number): number{

    const result = Math.pow(x, m) / Math.pow(y, n);
    return result;
}

