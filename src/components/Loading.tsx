import Image from "next/image"
import marshallIcon from "../../public/img/marshall-icn-loader.png"

const Loading = () => {

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-neutral-950 bg-opacity-70 flex justify-center align-middle z-50">
            <div className="h-fit self-center">
            <Image src={marshallIcon} alt="Marshall Icon" height={128} width={128} className="animate-pulse"/>
            </div>
        </div>
    )

}

export default Loading