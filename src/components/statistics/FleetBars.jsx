import React from 'react';
import {useTranslation} from 'react-i18next';

import {ReactComponent as TruckIcon} from './assets/icons/newIcon/image 35.svg';
import {ReactComponent as BusIcon} from './assets/icons/newIcon/5723550.svg';
import {ReactComponent as CarIcon} from './assets/icons/newIcon/image 26.svg';
import {ReactComponent as TrapIcon} from './assets/icons/newIcon/5723549.svg';
import {ReactComponent as TractorIcon} from './assets/icons/newIcon/5723548.svg';
import {ReactComponent as AutoLiftIcon} from './assets/icons/newIcon/5723552.svg';
import {ReactComponent as IBPIcon} from './assets/icons/newIcon/15.svg';
import {ReactComponent as TzIcon} from './assets/icons/newIcon/5723554.svg';
import {ReactComponent as FiretruckIcon} from './assets/icons/newIcon/5723550 (1).svg';
import {ReactComponent as SpecialcarIcon} from './assets/icons/newIcon/5723551 (1).svg';
import {ReactComponent as LentaIcon} from './assets/icons/newIcon/5723551.svg';
import {ReactComponent as TrainIcon} from '../../icons/iconsNews/Group 55892.svg';

import {vehicleLabelKey} from '../maps/newVersion/vehicleMeta';
import {EmptyState} from '../../ui/ui';

const GLYPH = {
    truck: TruckIcon,
    bus: BusIcon,
    car: CarIcon,
    ladder: TrapIcon,
    tractor: TractorIcon,
    reloaded: AutoLiftIcon,
    ibp: IBPIcon,
    tz: TzIcon,
    firetruck: FiretruckIcon,
    lenta: LentaIcon,
    specialcar: SpecialcarIcon,
    train: TrainIcon,
};

/** Transport turlari bo'yicha faol/nofaol nisbati. */
const FleetBars = ({data}) => {
    const {t} = useTranslation();
    const bars = data || [];

    if (!bars.length) return <EmptyState title={t("Ma'lumot yo'q")}/>;

    return (
        <div className="st-fleet">
            {bars.map((item) => {
                const active = item.active || 0;
                const inactive = item.inactive || 0;
                const total = active + inactive;
                const activePercent = total ? (active / total) * 100 : 0;
                const Glyph = GLYPH[item.type] || CarIcon;

                return (
                    <div className="st-fleet__row" key={item.type}>
                        <span className={`st-fleet__icon ${active > 0 ? 'is-active' : 'is-off'}`}><Glyph/></span>

                        <div className="st-fleet__body">
                            <div className="st-fleet__top">
                                <span className="st-fleet__name">{t(vehicleLabelKey(item.type)) || item.type}</span>
                                <span className="st-fleet__nums">
                                    <b>{active}</b> / {total}
                                </span>
                            </div>

                            <div className="st-fleet__track">
                                <div style={{width: `${activePercent}%`}} title={`${t('Faol')}: ${active}`}/>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FleetBars;
