const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

const size20mb = 20 * 1024 * 1024

export const checkFileSizeHelper = (fileSize: number | null) => {
    if (!fileSize) {
        return {
            fileSizeFormated: 0,
            isAvailableForUpload: false,
        }
    }
    return {
        fileSizeFormated: formatFileSize(fileSize),
        isAvailableForUpload: fileSize <= size20mb,
    }
}
