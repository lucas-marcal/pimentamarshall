import { type RouterOutputs } from "~/utils/api";

type Reseller = RouterOutputs["reseller"]["getAll"][number];

const StoreCard = (props: Reseller) => {
  const { name, address, instagram, instagramHandle, mapsLink, storeType } =
    props;

  return (
    <div className="mx-auto flex max-w-xs space-x-3 rounded-xl border-2 border-red-600 p-3">
      <div className="flex flex-col space-y-2">
        <h4 className="text-lg font-bold text-red-600">{name}</h4>
        <p className="text-lime-400">{storeType}</p>
        <p className="text-neutral-50">
          {address}{" "}
          <a
            href={mapsLink}
            className="text-red-600 transition hover:text-lime-400"
            target="_blank"
          >
            [ver no mapa]
          </a>
        </p>
        {instagram && (
          <p className="text-neutral-50">
            Instagram:{" "}
            <a
              href={instagram}
              className="text-red-600 transition hover:text-lime-400"
              target="_blank"
            >
              {instagramHandle}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default StoreCard