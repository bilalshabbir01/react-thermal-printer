import qz from "qz-tray"

qz.api.setSha256Type((data) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)))
qz.api.setPromiseType((promise) => new Promise(promise))

export default qz
