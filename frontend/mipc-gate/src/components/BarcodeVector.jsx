/**
 * Synthetic barcode SVG — evokes a high-tech scanning terminal aesthetic.
 * Deterministically generated from a seed string so it looks unique per card.
 */
const BarcodeVector = ({ seed = 'default', width = 80, height = 32, color = 'currentColor' }) => {
    // Generate pseudo-random bar widths from seed
    const bars = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }

    let x = 0;
    const totalBars = 28;
    const unitW = width / (totalBars * 1.5);

    for (let i = 0; i < totalBars; i++) {
        const pseudo = Math.abs(Math.sin(hash * (i + 1) * 7.3));
        const barW = unitW * (pseudo > 0.5 ? 2 : 1);
        const gap = unitW * (pseudo > 0.7 ? 1.2 : 0.8);
        if (i % 4 !== 3) {
            bars.push({ x, w: barW });
        }
        x += barW + gap;
        if (x >= width) break;
    }

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="barcode-svg"
            aria-hidden="true"
        >
            {bars.map((bar, i) => (
                <rect key={i} x={bar.x} y={0} width={bar.w} height={height} fill={color} />
            ))}
        </svg>
    );
};

export default BarcodeVector;
