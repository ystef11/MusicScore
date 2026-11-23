export function toRadians(degrees: number) {
    return degrees * (Math.PI / 180)
}

export function getSvgEllipseArcPath(
    centerX: any,
    centerY: any,
    radiusX: any,
    radiusY: any,
    startAngle: any,
    sweepAngle: any,
    rotationAngle: any,
) {
    const cosine = Math.cos
    const sine = Math.sin
    const pi = Math.PI

    const multiplyMatrixAndVector = (matrix: any, vector: any) => [
        matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
        matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
    ]

    const createRotationMatrix = (angle: any) => [
        [cosine(angle), -sine(angle)],
        [sine(angle), cosine(angle)],
    ]

    const addVectors = (vector1: any, vector2: any) => [
        vector1[0] + vector2[0],
        vector1[1] + vector2[1],
    ]

    const generateSvgEllipseArcPath = (
        centerX: any,
        centerY: any,
        radiusX: any,
        radiusY: any,
        startAngle: any,
        sweepAngle: any,
        rotationAngle: any,
    ) => {
        sweepAngle %= 2 * pi
        const rotationMatrix = createRotationMatrix(rotationAngle)
        const [startX, startY] = addVectors(
            multiplyMatrixAndVector(rotationMatrix, [
                radiusX * cosine(startAngle),
                radiusY * sine(startAngle),
            ]),
            [centerX, centerY],
        )
        const [endX, endY] = addVectors(
            multiplyMatrixAndVector(rotationMatrix, [
                radiusX * cosine(startAngle + sweepAngle),
                radiusY * sine(startAngle + sweepAngle),
            ]),
            [centerX, centerY],
        )
        const largeArcFlag = sweepAngle > pi ? 1 : 0
        const sweepFlag = sweepAngle > 0 ? 1 : 0

        return `M ${startX} ${startY} A ${radiusX} ${radiusY} ${
            (rotationAngle / (2 * pi)) * 360
        } ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`
    }

    return generateSvgEllipseArcPath(
        centerX,
        centerY,
        radiusX,
        radiusY,
        startAngle,
        sweepAngle,
        rotationAngle,
    )
}
