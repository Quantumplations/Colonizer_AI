import { Html } from "@react-three/drei";
import type { Vector3Tuple } from "three";

type ObjectLabelProps = {
  text: string;
  position?: Vector3Tuple;
};

function ObjectLabel({ text, position = [0, 0.14, 0] }: ObjectLabelProps) {
  return (
    <Html position={position} center distanceFactor={8}>
      <div className="rounded bg-slate-900/85 px-2 py-1 text-[10px] font-medium text-slate-100">
        {text}
      </div>
    </Html>
  );
}

export default ObjectLabel;

